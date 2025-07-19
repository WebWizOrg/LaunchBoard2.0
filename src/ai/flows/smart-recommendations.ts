// src/ai/flows/smart-recommendations.ts
'use server';

/**
 * @fileOverview Provides AI-powered resume bullet point suggestions based on job title and industry.
 *
 * - getAiPoweredResumeRecommendations - A function that returns resume bullet point suggestions.
 * - AiPoweredResumeRecommendationsInput - The input type for the getAiPoweredResumeRecommendations function.
 * - AiPoweredResumeRecommendationsOutput - The return type for the getAiPoweredResumeRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredResumeRecommendationsInputSchema = z.object({
  jobTitle: z.string().describe('The job title for which to generate resume bullet points.'),
  industry: z.string().describe('The industry for which to generate resume bullet points.'),
});
export type AiPoweredResumeRecommendationsInput = z.infer<typeof AiPoweredResumeRecommendationsInputSchema>;

const AiPoweredResumeRecommendationsOutputSchema = z.object({
  bulletPoints: z.array(z.string()).describe('An array of suggested bullet points for the resume.'),
});
export type AiPoweredResumeRecommendationsOutput = z.infer<typeof AiPoweredResumeRecommendationsOutputSchema>;

export async function getAiPoweredResumeRecommendations(
  input: AiPoweredResumeRecommendationsInput
): Promise<AiPoweredResumeRecommendationsOutput> {
  return aiPoweredResumeRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredResumeRecommendationsPrompt',
  input: {schema: AiPoweredResumeRecommendationsInputSchema},
  output: {schema: AiPoweredResumeRecommendationsOutputSchema},
  prompt: `You are an expert resume writer. Generate 5 bullet points for a resume, tailored to the job title "{{jobTitle}}" in the "{{industry}}" industry.

Ensure the bullet points are concise and impactful, highlighting relevant skills and experience.

Output format: JSON array of strings.

Example:
[
  "Successfully managed a team of 5 engineers...",
  "Developed and implemented a new feature...",
  "Improved system performance by 15%...",
  "Collaborated with cross-functional teams...",
  "Mentored junior engineers..."
]
`,
});

const aiPoweredResumeRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiPoweredResumeRecommendationsFlow',
    inputSchema: AiPoweredResumeRecommendationsInputSchema,
    outputSchema: AiPoweredResumeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
