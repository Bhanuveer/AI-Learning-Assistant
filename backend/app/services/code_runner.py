"""Prototype evaluator for learner-submitted code.

PROTOTYPE ONLY. It runs the code in a separate, isolated-mode Python process
with an empty environment, CPU/file limits, a per-test timer, an import
allow-list and an AST pre-check. This reduces risk but is NOT a security
sandbox. `run_tests` is the single entry point so it can later be replaced by
a real sandbox (container, gVisor, remote runner) without touching callers.
"""

import ast
import json
import subprocess
import sys
import tempfile

ALLOWED_IMPORTS = {
    "math", "itertools", "collections", "functools", "heapq", "bisect",
    "re", "string", "statistics", "operator", "typing",
}
FORBIDDEN_NAMES = {
    "exec", "eval", "open", "compile", "__import__", "globals", "locals",
    "vars", "input", "breakpoint", "getattr", "setattr", "delattr", "memoryview",
}
MAX_CODE_CHARS = 5000
PER_TEST_SECONDS = 1.0
TOTAL_TIMEOUT_SECONDS = 15

_RUNNER = r'''
import sys, json, io, signal, time, builtins, resource

payload = json.loads(sys.stdin.read())
real_stdout = sys.stdout
sys.stdout = io.StringIO()

ALLOWED = set(payload["allowed_imports"])
BLOCKED = set(payload["forbidden_names"])

try:
    resource.setrlimit(resource.RLIMIT_CPU, (20, 20))
    resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))
except Exception:
    pass

def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name.split(".")[0] not in ALLOWED:
        raise ImportError("import of '%s' is not allowed" % name)
    return builtins.__import__(name, globals, locals, fromlist, level)

safe_builtins = {k: v for k, v in vars(builtins).items() if k not in BLOCKED}
safe_builtins["__import__"] = safe_import

class Timeout(Exception):
    pass

def on_alarm(signum, frame):
    raise Timeout()

signal.signal(signal.SIGALRM, on_alarm)

def normalise(value):
    if isinstance(value, (tuple, list)):
        return [normalise(v) for v in value]
    if isinstance(value, dict):
        return {str(k): normalise(v) for k, v in value.items()}
    return value

def same(got, expected, tol):
    if isinstance(expected, float) or isinstance(got, float):
        try:
            return abs(float(got) - float(expected)) <= tol
        except Exception:
            return False
    if isinstance(expected, list):
        return isinstance(got, list) and len(got) == len(expected) and all(same(g, e, tol) for g, e in zip(got, expected))
    if isinstance(expected, dict):
        return isinstance(got, dict) and set(got) == set(expected) and all(same(got[k], expected[k], tol) for k in expected)
    return got == expected and type(got) == type(expected) if isinstance(expected, bool) else got == expected

result = {"defined": False, "cases": [], "perf_ok": None, "error": None}
namespace = {"__builtins__": safe_builtins, "__name__": "submission"}
try:
    signal.setitimer(signal.ITIMER_REAL, 2.0)
    exec(compile(payload["code"], "<submission>", "exec"), namespace)
    signal.setitimer(signal.ITIMER_REAL, 0)
    fn = namespace.get(payload["function"])
    result["defined"] = callable(fn)
    if not result["defined"]:
        result["error"] = "Function '%s' is not defined" % payload["function"]
except Timeout:
    result["error"] = "Timed out while loading the code"
except BaseException as exc:
    signal.setitimer(signal.ITIMER_REAL, 0)
    result["error"] = "%s: %s" % (type(exc).__name__, exc)

if result["defined"]:
    timed_out = False
    for args, expected in payload["tests"]:
        case = {"ok": False, "error": None, "got": None}
        if timed_out:
            case["error"] = "Skipped after a timeout"
            result["cases"].append(case)
            continue
        try:
            signal.setitimer(signal.ITIMER_REAL, payload["per_test_seconds"])
            got = normalise(fn(*args))
            signal.setitimer(signal.ITIMER_REAL, 0)
            case["ok"] = bool(same(got, expected, payload["tolerance"]))
            case["got"] = repr(got)[:120]
        except Timeout:
            case["error"] = "Timed out"
            timed_out = True
        except BaseException as exc:
            signal.setitimer(signal.ITIMER_REAL, 0)
            case["error"] = "%s: %s" % (type(exc).__name__, exc)
        result["cases"].append(case)

    perf = payload.get("perf")
    if perf and timed_out:
        result["perf_ok"] = False
    elif perf:
        try:
            args = [list(range(perf["n"]))]
            signal.setitimer(signal.ITIMER_REAL, payload["per_test_seconds"])
            got = normalise(fn(*args))
            signal.setitimer(signal.ITIMER_REAL, 0)
            result["perf_ok"] = bool(same(got, perf["expected"], payload["tolerance"]))
        except BaseException:
            signal.setitimer(signal.ITIMER_REAL, 0)
            result["perf_ok"] = False

sys.stdout = real_stdout
print(json.dumps(result))
'''


def static_check(code, function_name):
    """Cheap pre-flight checks. Returns an error string or None."""
    if not code or not code.strip():
        return "No code submitted"
    if len(code) > MAX_CODE_CHARS:
        return f"Code is too long (max {MAX_CODE_CHARS} characters)"
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return f"Syntax error on line {exc.lineno}: {exc.msg}"

    defines = False
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] not in ALLOWED_IMPORTS:
                    return f"Import of '{alias.name}' is not allowed"
        elif isinstance(node, ast.ImportFrom):
            if (node.module or "").split(".")[0] not in ALLOWED_IMPORTS:
                return f"Import from '{node.module}' is not allowed"
        elif isinstance(node, ast.Name) and node.id in FORBIDDEN_NAMES:
            return f"Use of '{node.id}' is not allowed"
        elif isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            return "Access to dunder attributes is not allowed"
        elif isinstance(node, ast.FunctionDef) and node.name == function_name:
            defines = True
    if not defines:
        return f"Define a function named '{function_name}'"
    return None


def run_tests(code, function_name, tests, tolerance=0.0, perf=None):
    """Run `tests` ([[args, expected], ...]) against the submission.

    Returns {"ok": bool, "error": str|None, "cases": [...], "perf_ok": bool|None}.
    """
    problem = static_check(code, function_name)
    if problem:
        return {"ok": False, "error": problem, "cases": [], "perf_ok": None}

    payload = json.dumps({
        "code": code,
        "function": function_name,
        "tests": tests,
        "tolerance": tolerance,
        "perf": perf,
        "per_test_seconds": PER_TEST_SECONDS,
        "allowed_imports": sorted(ALLOWED_IMPORTS),
        "forbidden_names": sorted(FORBIDDEN_NAMES),
    })

    try:
        with tempfile.TemporaryDirectory() as workdir:
            completed = subprocess.run(
                [sys.executable, "-I", "-c", _RUNNER],
                input=payload, capture_output=True, text=True,
                timeout=TOTAL_TIMEOUT_SECONDS, cwd=workdir, env={},
            )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": "Execution timed out", "cases": [], "perf_ok": None}

    try:
        result = json.loads(completed.stdout.strip().splitlines()[-1])
    except (ValueError, IndexError):
        return {"ok": False, "error": "The code could not be evaluated", "cases": [], "perf_ok": None}

    result["ok"] = result.get("defined", False)
    return result
