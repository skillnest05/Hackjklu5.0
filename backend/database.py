"""
SQLite Database Layer
Stores essay evaluations for history retrieval.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "essays.db")


def get_connection():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database tables."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL DEFAULT '',
            prompt TEXT NOT NULL DEFAULT '',
            essay_text TEXT NOT NULL,
            submitted_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'evaluated',
            overall_score INTEGER NOT NULL,
            scores TEXT NOT NULL,
            feedback TEXT NOT NULL,
            issues TEXT NOT NULL DEFAULT '[]',
            word_count INTEGER NOT NULL DEFAULT 0,
            reading_time TEXT NOT NULL DEFAULT '1 min'
        )
    """)
    conn.commit()
    conn.close()


def save_evaluation(data: dict) -> int:
    """Save an evaluation to the database and return the ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO evaluations 
        (title, prompt, essay_text, submitted_at, status, overall_score, 
         scores, feedback, issues, word_count, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["title"],
        data["prompt"],
        data["essay_text"],
        data["submitted_at"],
        data["status"],
        data["overall_score"],
        json.dumps(data["scores"]),
        json.dumps(data["feedback"]),
        json.dumps(data["issues"]),
        data["word_count"],
        data["reading_time"],
    ))
    conn.commit()
    eval_id = cursor.lastrowid
    conn.close()
    return int(eval_id) if eval_id else 0


def get_all_evaluations() -> list[dict]:
    """Retrieve all evaluations from the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evaluations ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "title": row["title"],
            "prompt": row["prompt"],
            "essay_text": row["essay_text"],
            "submitted_at": row["submitted_at"],
            "status": row["status"],
            "overall_score": row["overall_score"],
            "scores": json.loads(row["scores"]),
            "feedback": json.loads(row["feedback"]),
            "issues": json.loads(row["issues"]),
            "word_count": row["word_count"],
            "reading_time": row["reading_time"],
        })
    return results


def get_evaluation_by_id(eval_id: int) -> dict | None:
    """Retrieve a single evaluation by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evaluations WHERE id = ?", (eval_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return {
        "id": row["id"],
        "title": row["title"],
        "prompt": row["prompt"],
        "essay_text": row["essay_text"],
        "submitted_at": row["submitted_at"],
        "status": row["status"],
        "overall_score": row["overall_score"],
        "scores": json.loads(row["scores"]),
        "feedback": json.loads(row["feedback"]),
        "issues": json.loads(row["issues"]),
        "word_count": row["word_count"],
        "reading_time": row["reading_time"],
    }


def delete_evaluation(eval_id: int) -> bool:
    """Delete an evaluation by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM evaluations WHERE id = ?", (eval_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


def get_stats() -> dict:
    """Get aggregate statistics."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            COALESCE(AVG(overall_score), 0) as avg_score,
            COALESCE(MAX(overall_score), 0) as max_score,
            COALESCE(MIN(overall_score), 0) as min_score
        FROM evaluations
    """)
    row = cursor.fetchone()
    conn.close()

    return {
        "total_essays": row["total"],
        "avg_score": round(row["avg_score"], 1),
        "max_score": row["max_score"],
        "min_score": row["min_score"],
    }
