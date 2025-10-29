import { RequestHandler } from 'express';
import { ServerError } from '../types';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

export const queryOpenAI: RequestHandler = async (_req, res, next) => {
  const { naturalLanguageQuery } = res.locals;

  if (!naturalLanguageQuery) {
    const error: ServerError = {
      log: 'OpenAI query middleware did not receive a query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  const role =
    'You are a cover letter generator. Your task is to create conversational and concise cover letters.';

  // UPDATE SIGNATURE HERE
  const task = `

        The user content will be a job description.  

        To compose a compelling cover letter, you must scrutinise the job description for key qualifications. Begin with a succinct introduction about the candidate's identity and career goals. Highlight skills aligned with the job, underpinned by tangible examples. Incorporate details about the company, emphasising its mission or unique aspects that align with the candidate's values. Conclude by reaffirming the candidate's suitability, inviting further discussion. Use job-specific terminology for a tailored and impactful letter, maintaining a professional style suitable for a the job role. Please provide your response in under 350 words.

        Format a cover letter for the candidate in the following structure:

        Dear [target audience],

        cover letter content

        All the Best, 
        Lane Hamilton
        614-284-5263
        aleyna.hamilton@gmail.com

  `;

  // Read resume from file
  const resumeFilePath = path.join(__dirname, '../data/resume.pdf');

  // Parse PDF
  const parser = new PDFParse({ url: resumeFilePath });
  const result = await parser.getText();
  await parser.destroy();

  const rules = `
  1. Output format should be in markdown formatted left justified, single spaced with 2 lines between paragraphs and after the salutation. Like a letter 
  2. It should not include ANY additional content than the cover letter itself          
  3. Don't lie or make up any experience to better fit the job description, only use the experience listed and what can be logically inferred from that experience
  4. Don't directly quote anything from the job description. If you want to tie a link between experience and job requirements, change the wording enough so it is not a direct pull
`;

  const systemPrompt = `
  ${role}

  ${task}

  Job Description:
  ${naturalLanguageQuery}

  Resume:
  ${result.text}

  Rules: 
  ${rules}
`;

  //  Path to the queries.json file
  const queriesFilePath = path.join(__dirname, '../data/cover_letters.json');

  // Read and update the queries.json file
  let queriesData: Record<string, Array<{ returnedQuery: string }>> = {};

  if (fs.existsSync(queriesFilePath)) {
    const fileContent = fs.readFileSync(queriesFilePath, 'utf-8');
    queriesData = fileContent ? JSON.parse(fileContent) : {};
  }

  try {
    const response = await client.responses.create({
      model: 'gpt-5-nano',
      reasoning: { effort: 'low' }, // could also try medium
      instructions: 'Responses must be conversational but professional',
      input: systemPrompt,
    });

    const returnedQuery = response.output_text;

    if (!returnedQuery) {
      const error: ServerError = {
        log: 'OpenAI did not return a valid SQL query',
        status: 500,
        message: { err: 'An error occurred while querying OpenAI' },
      };
      return next(error);
    }

    // Update the queries object
    if (!queriesData[naturalLanguageQuery]) {
      queriesData[naturalLanguageQuery] = [];
    }
    queriesData[naturalLanguageQuery].push({ returnedQuery });

    // Write the updated object back to the file
    fs.writeFileSync(
      queriesFilePath,
      JSON.stringify(queriesData, null, 2),
      'utf-8'
    );

    res.locals.coverLetter = returnedQuery; // save to response object

    return next();
  } catch (err) {
    const error: ServerError = {
      log: `OpenAI query failed: ${(err as Error).message}`,
      status: 500,
      message: { err: 'An error occurred while querying OpenAI' },
    };
    return next(error);
  }
};
