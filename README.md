# CoverBot: AI Cover Letter Generator

## Overview

CoverBot is a tool that automatically generates tailored cover letters based on your resume and job descriptions. Simply paste a job description into the application, and CoverBot will create a customized cover letter highlighting your relevant experience and skills.

Forked from [CoverBot](https://github.com/mcphail-alex/CoverBot)

## Setup

1. Place your resume as a `.pdf` file in the `/server/data` directory
2. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Customize your signature in openaiController.ts
4. Start the application
5. Paste a job description into the input window
6. The tool will generate a personalized cover letter that you can copy from the output window

## Usage

1. Open the application in your browser at `http://localhost:8080/`
2. In the job description field, paste the complete job listing text
3. Click "Generate Cover Letter"
4. Review the generated cover letter in the output window
5. Copy the text for use in your application

## Current Features

- Personalized cover letter generation based on your resume and job descriptions
- User-friendly interface
- Fast generation using OpenAI's language models

## Upcoming Features

- Export to PDF functionality
- Resume import/update capability
- Additional customization options

## Development

### Getting Started

- Fork and clone this repo
- Add your resume and OpenAI API key as described in the setup section
- Install dependencies with `npm install`
- Start the development server with `npm run start`

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
