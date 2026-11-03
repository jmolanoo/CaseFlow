from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            # Check user_ai_credentials.help_desk_id
            res = conn.execute(text("PRAGMA table_info(user_ai_credentials)")).fetchall()
            cols = [r[1] for r in res]
            if cols and "help_desk_id" not in cols:
                conn.execute(text("ALTER TABLE user_ai_credentials ADD COLUMN help_desk_id INTEGER REFERENCES help_desks(id) ON DELETE CASCADE"))
                conn.commit()

            # Check help_desk_members.is_active
            res_m = conn.execute(text("PRAGMA table_info(help_desk_members)")).fetchall()
            cols_m = [r[1] for r in res_m]
            if cols_m and "is_active" not in cols_m:
                conn.execute(text("ALTER TABLE help_desk_members ADD COLUMN is_active BOOLEAN DEFAULT 1"))
                conn.commit()
    except Exception as e:
        print(f"Notice during migration check: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
