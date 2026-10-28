"""An isolated database for browser tests; never touches demo.db or MySQL."""

import tempfile
from pathlib import Path
from backend.app import create_app

if __name__ == "__main__":
    with tempfile.TemporaryDirectory(prefix="schoolhouse-e2e-") as directory:
        create_app(str(Path(directory) / "test.db")).run(host="127.0.0.1", port=5002)
