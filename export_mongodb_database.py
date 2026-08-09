import os
import json
from bson import json_util
from pymongo import MongoClient

def export_mongodb():
    connection_string = os.getenv(
        "MONGODB_CONNECTION_STRING",
        "mongodb+srv://ekantabanik_db_user:Qh2k8Zh4WkEcwPLP@cluster0.bzt8ohz.mongodb.net/?appName=Cluster0"
    )
    db_name = os.getenv("MONGODB_DATABASE_NAME", "assignment_management")

    print(f"Connecting to MongoDB Atlas database: '{db_name}'...")
    client = MongoClient(connection_string)
    db = client[db_name]

    output_dir = os.path.join(os.getcwd(), "mongodb_backup")
    os.makedirs(output_dir, exist_ok=True)

    collection_names = db.list_collection_names()
    print(f"Found {len(collection_names)} collections: {collection_names}")

    for collection_name in collection_names:
        collection = db[collection_name]
        documents = list(collection.find())
        
        file_path = os.path.join(output_dir, f"{collection_name}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(json_util.dumps(documents, indent=2))
            
        print(f"[OK] Exported {len(documents)} documents to: {file_path}")

    # Also generate a consolidated all_database_data.json
    all_data = {}
    for collection_name in collection_names:
        collection = db[collection_name]
        all_data[collection_name] = list(collection.find())

    master_file_path = os.path.join(output_dir, "all_database_data.json")
    with open(master_file_path, "w", encoding="utf-8") as f:
        f.write(json_util.dumps(all_data, indent=2))
    print(f"[OK] Exported master database file to: {master_file_path}")

    print("\nMongoDB Database Export Completed Successfully!")
    print(f"All JSON database files are saved in: {output_dir}")

if __name__ == "__main__":
    export_mongodb()
