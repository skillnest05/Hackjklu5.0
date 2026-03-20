import sqlite3
import json

conn = sqlite3.connect('essays.db')
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE evaluations ADD COLUMN argument_map TEXT NOT NULL DEFAULT '{\"nodes\": [], \"edges\": []}'")
    conn.commit()
    print("Database altered successfully")
except sqlite3.OperationalError as e:
    print(f"Error (column might already exist): {e}")
finally:
    conn.close()
