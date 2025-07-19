'use server';
/**
 * @fileOverview An AI flow to generate a portfolio project summary from a GitHub repository.
 *
 * - generateProjectFromRepo - A function that takes a GitHub repo URL and returns a structured project summary.
 * - GenerateProjectFromRepoInput - The input type for the generateProjectFromRepo function.
 * - GenerateProjectFromRepoOutput - The return type for the generateProjectFromRepo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GENKIT_ENV } from 'genkit/environment';

const GenerateProjectFromRepoInputSchema = z.object({
  githubRepoUrl: z.string().url().describe('The URL of the public GitHub repository.'),
});
export type GenerateProjectFromRepoInput = z.infer<typeof GenerateProjectFromRepoInputSchema>;

const GenerateProjectFromRepoOutputSchema = z.object({
  projectName: z.string().describe('A compelling name for the project.'),
  projectDescription: z.string().describe('A detailed and engaging description of the project, highlighting its purpose, features, and accomplishments. Should be written in markdown format.'),
  technologies: z.array(z.string()).describe('A list of key technologies, frameworks, and languages used in the project.'),
});
export type GenerateProjectFromRepoOutput = z.infer<typeof GenerateProjectFromRepoOutputSchema>;

export async function generateProjectFromRepo(input: GenerateProjectFromRepoInput): Promise<GenerateProjectFromRepoOutput> {
  return generateProjectFromRepoFlow(input);
}


// Helper function to extract README content from a GitHub URL
async function getReadmeContent(repoUrl: string): Promise<string> {
  // We need to transform a github.com URL to a raw.githubusercontent.com URL
  const rawUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/README.md';

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
       // Try 'master' branch as a fallback
       const fallbackUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/master/README.md';
       const fallbackResponse = await fetch(fallbackUrl);
       if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch README from ${rawUrl} and ${fallbackUrl}`);
       }
       return await fallbackResponse.text();
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    throw new Error('Could not retrieve README.md from the repository. Please ensure the URL is correct and the repository is public.');
  }
}


const prompt = ai.definePrompt({
  name: 'generateProjectFromRepoPrompt',
  input: { schema: z.object({ readmeContent: z.string() }) },
  output: { schema: GenerateProjectFromRepoOutputSchema },
  prompt: `You are an expert technical writer and developer portfolio consultant. Your task is to analyze the following README.md file content and generate a concise, compelling project summary suitable for a developer's portfolio.

Based on the README content below, generate:
1.  A short, catchy project name.
2.  A detailed project description. Explain what the project is, what problem it solves, and its key features. Use Markdown for formatting (e.g., bullet points for features).
3.  A list of the primary technologies, languages, and frameworks used.

README.md Content:
\`\`\`
{{{readmeContent}}}
\`\`\`
`,
});

const generateProjectFromRepoFlow = ai.defineFlow(
  {
    name: 'generateProjectFromRepoFlow',
    inputSchema: GenerateProjectFromRepoInputSchema,
    outputSchema: GenerateProjectFromRepoOutputSchema,
  },
  async (input) => {
    
    const readmeContent = await getReadmeContent(input.githubRepoUrl);

    const { output } = await prompt({ readmeContent });
    if (!output) {
        throw new Error('The AI failed to generate a project summary.');
    }
    return output;
  }
);
