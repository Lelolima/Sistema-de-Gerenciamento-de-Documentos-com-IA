import pytest
from fastapi import HTTPException

from utils.security import SecurityValidator


def test_sanitize_filename_blocks_path_traversal():
    assert SecurityValidator.sanitize_filename("../../etc/passwd") == "passwd"
    assert SecurityValidator.sanitize_filename("..\\..\\win.ini") == "win.ini"


def test_validate_file_too_big():
    with pytest.raises(HTTPException) as e:
        SecurityValidator.validate_file("a.pdf", "application/pdf", SecurityValidator.MAX_FILE_SIZE + 1)
    assert e.value.status_code == 400


def test_validate_file_ok():
    assert SecurityValidator.validate_file("a.PDF", "application/pdf", 10) is True
