import os
from xml.sax.saxutils import escape

from reportlab.lib.styles import (
    getSampleStyleSheet
)
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate
)


def create_notes_pdf(
    file_path,
    notes
):

    export_folder = os.path.dirname(
        file_path
    )

    if export_folder:

        os.makedirs(
            export_folder,
            exist_ok=True
        )

    doc = SimpleDocTemplate(
        file_path
    )

    styles = (
        getSampleStyleSheet()
    )

    formatted_notes = escape(
        notes
    ).replace(
        "\n",
        "<br/>"
    )

    content = [
        Paragraph(
            formatted_notes,
            styles["BodyText"]
        )
    ]

    doc.build(
        content
    )
