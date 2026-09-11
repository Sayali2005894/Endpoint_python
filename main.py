# from fastapi import FastAPI
# from supabase import create_client
# from dotenv import load_dotenv
# import os

# # Load variables from .env complete code

# load_dotenv()

# # Create FastAPI application
# app = FastAPI()

# # Get Supabase credentials
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel          # <-- Added
from supabase import create_client
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Supabase Connection Checker")

# CORS (for VS Code Live Server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500","https://endpoint-python-bgsn-git-main-sayalinavkar-7689.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Read credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.get("/")
# def check_connection():
#     try:
#         # Test the connection by reading one row
#         supabase.table("students").select("*").limit(1).execute()

#         return {
#             "status": "Connected",
#             "message": "Supabase is connected successfully."
#         }

#     except Exception as e:
#         return {
#             "status": "Connection Failed",
#             "error": str(e)
#         }

def check_connection():
    try:
        response = supabase.table("student").select("*").limit(1).execute()
        return {
            "status": "Connected",
            "message": "Supabase connected successfully.",
            "records_found": len(response.data)
        }
    except Exception as e:
        return {
            "status": "Connection Failed",
            "error": str(e)
        }


# =========================================================
#               ADDED BY SENIOR DEVELOPER
#          (Existing code kept unchanged)
# =========================================================

# Request model for POST and PUT
class Student(BaseModel):
    name: str
    course: str
    marks: int


# GET - Read all students
@app.get("/students")
def get_students():
    try:
        response = supabase.table("student").select("*").execute()
        return response.data
    except Exception as e:
        return {"status": "Failed", "error": str(e)}


# POST - Add a new student
@app.post("/students")
def add_student(student: Student):
    try:
        response = (
            supabase
            .table("student")
            .insert(student.model_dump())
            .execute()
        )

        return {
            "status": "Student Added Successfully",
            "data": response.data
        }

    except Exception as e:
        return {"status": "Failed", "error": str(e)}


# PUT - Update student by ID
@app.put("/students/{id}")
def update_student(id: int, student: Student):
    try:
        response = (
            supabase
            .table("student")
            .update(student.model_dump())
            .eq("id", id)
            .execute()
        )

        return {
            "status": "Student Updated Successfully",
            "data": response.data
        }

    except Exception as e:
        return {"status": "Failed", "error": str(e)}


# DELETE - Delete student by ID
@app.delete("/students/{id}")
def delete_student(id: int):
    try:
        response = (
            supabase
            .table("student")
            .delete()
            .eq("id", id)
            .execute()
        )

        return {
            "status": "Student Deleted Successfully",
            "data": response.data
        }

    except Exception as e:
        return {"status": "Failed", "error": str(e)}
