import os
from sqlalchemy.orm import Session

from .database import SessionLocal
from . import models


# relative to this file -> backend/app/static/sneakers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SNEAKERS_DIR = os.path.join(BASE_DIR, "static", "sneakers")
# URL prefix used in the database (must match what FastAPI serves)
URL_PREFIX = "/static/sneakers"


def main():
    if not os.path.isdir(SNEAKERS_DIR):
        raise SystemExit(f"Image directory not found: {SNEAKERS_DIR}")

    # collect all .jpg / .jpeg / .png files
    files = [
        f
        for f in os.listdir(SNEAKERS_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    if not files:
        raise SystemExit("No image files found in static/sneakers")

    # sort them numerically if they are like 0.jpg, 1.jpg, etc.
    def numeric_key(name: str):
        base, _ext = os.path.splitext(name)
        try:
            return int(base)
        except ValueError:
            return 999999  # non-numeric go to the end

    files.sort(key=numeric_key)

    print("Found image files (sorted):")
    for f in files:
        print("  ", f)

    db: Session = SessionLocal()
    try:
        # get all sneakers ordered by id
        sneakers = db.query(models.Sneaker).order_by(models.Sneaker.id).all()
        if not sneakers:
            raise SystemExit("No sneakers in database to assign images to.")

        print(f"\nAssigning images to {len(sneakers)} sneakers...")

        for sneaker, filename in zip(sneakers, files):
            image_url = f"{URL_PREFIX}/{filename}"
            print(f"  Sneaker id={sneaker.id} -> {image_url}")
            sneaker.image_url = image_url

        db.commit()
        print("\n✅ Done! Images assigned and committed to database.")
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
