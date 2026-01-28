# ANPRS

Automatic Number Plate Recognition (ANPR) system designed specifically for Nepali license plates
## 🔍 Overview

This project implements a complete ANPR pipeline:

1. **Plate Detection** - Detects license plates from images or video frames
2. **Character Segmentation** - Segments individual characters from the detected plate
3. **Character Recognition** - Recognizes the segmented characters

## 📂 Project Structure

```
ANPRS/
├── application/          # Flask web application
│   ├── app.py           # Main Flask application
│   ├── config.py        # Application configuration
│   ├── model_loader.py  # Model loading utilities
│   ├── image_processing.py  # Image processing pipeline
│   ├── templates/       # HTML templates
│   └── static/          # Static assets (CSS, JS, images)
├── models/              # Machine learning models
│   ├── pd-traific/      # Plate detection model
│   ├── sg/              # Segmentation model
│   └── char-traiffic/   # Character recognition model
├── main.py
├── .python-version
└── pyproject.toml       # Project dependencies and metadata
```

## 🚀 Installation

This project uses [UV](https://github.com/astral-sh/uv), an extremely fast Python package and project manager written in Rust. Follow these steps to set up the project:

### Prerequisites

1. Python 3.10 or higher
2. [UV](https://github.com/astral-sh/uv) installed on your system

### Install Dependencies with UV

```bash
uv sync
```

This will install all dependencies defined in the `pyproject.toml` file.

## 🏃 Running the Application

Start the Flask application:

```bash
cd application
python -m flask run -p 3000
```

The web interface will be available at `http://127.0.0.1:3000/`

## 🔄 Pipeline Process

The ANPR system follows this workflow:

1. **Plate Detection (PD)**: Uses YOLOv8-based model to detect license plates in images
2. **Segmentation (SG)**: Isolates and segments characters from the detected plate
3. **Character Recognition (CHAR)**: Recognizes individual characters using a trained model

