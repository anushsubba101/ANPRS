# ANPRS - Automatic Nepali Number Plate Recognition System

ANPRS is a full-stack Automatic Number Plate Recognition system tailored for Nepali license plates. It features a robust Python/Flask backend utilizing YOLO and DeepSort for detection and tracking, and a modern React/Vite frontend for a seamless user experience.

## 🚀 Features

*   **Plate Detection**: Utilizes YOLOv8 for accurate license plate detection.
*   **Character Segmentation**: Segments individual characters from the plate.
*   **Character Recognition**: Recognizes Nepali characters using a trained deep learning model.
*   **Real-time Tracking**: (Backend capability with DeepSort)
*   **Modern UI**: Responsive React frontend for easy image upload and result visualization.

## 🛠️ Tech Stack

### Backend
*   **Language**: Python 3.10+
*   **Framework**: Flask
*   **ML Libraries**: Ultralytics YOLO, PyTorch, DeepSort Realtime, Lap, NumPy
*   **Package Manager**: [UV](https://github.com/astral-sh/uv)

### Frontend
*   **Framework**: React (via Vite)
*   **Styling**: Tailwind CSS (implied by design patterns), Lucide React (Icons)
*   **Animation**: Framer Motion

## 📂 Project Structure

```
ANPRS/
├── backend/             # Flask API and ML Models
│   ├── app/             # Application source code
│   │   ├── app.py       # Main Flask entry point
│   │   ├── config.py    # Configuration settings
│   │   ├── models/      # PyTorch/YOLO models
│   │   └── ...
│   ├── pyproject.toml   # Python dependencies (UV)
│   └── ...
├── frontend/            # React Frontend
│   ├── src/             # React source components
│   ├── package.json     # Node dependencies
│   └── ...
└── README.md            # This file
```

## ⚙️ Installation & Setup

### Prerequisites

*   **Python**: Version 3.10 or higher.
*   **Node.js**: Version 18+ recommended.
*   **UV**: High-performance Python package manager (`pip install uv` or follow [official docs](https://github.com/astral-sh/uv)).

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies using UV:
    ```bash
    uv sync
    ```

3.  **Configuration Check**:
    > [!IMPORTANT]
    > Open `backend/app/config.py` and ensure the `FONT_PATH` matches your system's font location if you need to render specific text on images. Currently, it might be pointing to a development path like `F:/development/...`. Update it to a valid path or ensure the font exists.

4.  Run the backend server:
    ```bash
    cd app
    uv run python app.py
    ```
    The server will start at `http://0.0.0.0:5001`.

### Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically be available at `http://localhost:5173`.

## 📖 Usage

1.  Ensure both the Backend and Frontend servers are running.
2.  Open your browser and navigate to the Frontend URL (e.g., `http://localhost:5173`).
3.  Use the "Upload" feature to select an image of a vehicle with a Nepali license plate.
4.  View the processed results, including the detected plate, segmented characters, and recognized text.

## 🔌 API Documentation

### `POST /api/anpr`

Uploads an image for ANPR processing.

**Request:**
*   **Content-Type**: `multipart/form-data`
*   **Body**: `file` (The image file: .jpg, .png, .jpeg, etc.)

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "results": [
            {
                "confidence": 0.89,
                "final_text": "BAA 1234",
                "plate_dimensions": { "width": 200, "height": 60 },
                "original_plate": "<base64_string>",
                "deskewed_plate": "<base64_string>",
                "digital_plate": "<base64_string>"
            }
        ],
        "meta": {
            "filename": "car_image.jpg",
            "processed_at": "2024-03-20T10:00:00+05:45",
            "duration_seconds": 0.452
        }
    }
}
```

**Error Responses:**
*   `400 Bad Request`: Missing file or no filename.
*   `415 Unsupported Media Type`: Invalid file extension.
*   `503 Service Unavailable`: Models not loaded.
*   `500 Internal Server Error`: Processing failure.
