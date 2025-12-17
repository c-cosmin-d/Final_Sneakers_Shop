from sqlalchemy.orm import Session
from .database import SessionLocal
from . import models


MEN_SIZES = [41, 42, 43, 44, 45, 46]
WOMEN_SIZES = [35, 36, 37, 38, 39, 40, 41]


def main():
    db: Session = SessionLocal()
    try:
        sneakers = db.query(models.Sneaker).all()
        if not sneakers:
            print("No sneakers found.")
            return

        created = 0
        for sneaker in sneakers:
            gender = (sneaker.gender or "").lower()
            sizes = WOMEN_SIZES if gender == "women" else MEN_SIZES

            for size in sizes:
                # skip if size already exists
                existing = (
                    db.query(models.SneakerSize)
                    .filter_by(sneaker_id=sneaker.id, eu_size=size)
                    .first()
                )
                if existing:
                    continue

                db.add(
                    models.SneakerSize(
                        sneaker_id=sneaker.id,
                        eu_size=size,
                        stock=10,  # default stock
                    )
                )
                created += 1

        db.commit()
        print(f"✅ Created {created} size rows.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
