'use server';
/**
 * @fileOverview Converts a PDF file into a PNG image data URI.
 * - pdfToImage - A function that handles the PDF to image conversion.
 * - PdfToImageInput - The input type for the pdfToImage function.
 * - PdfToImageOutput - The return type for the pdfToImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import { Canvas, createCanvas, Image } from 'canvas';

// This is a workaround to make pdfjs work with canvas in a Node.js environment
class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas,
      context,
    };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const PdfToImageInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type PdfToImageInput = z.infer<typeof PdfToImageInputSchema>;

const PdfToImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The first page of the PDF rendered as a PNG image data URI."
    ),
});
export type PdfToImageOutput = z.infer<typeof PdfToImageOutputSchema>;

export async function pdfToImage(input: PdfToImageInput): Promise<PdfToImageOutput> {
  return pdfToImageFlow(input);
}

const pdfToImageFlow = ai.defineFlow(
  {
    name: 'pdfToImageFlow',
    inputSchema: PdfToImageInputSchema,
    outputSchema: PdfToImageOutputSchema,
  },
  async ({ pdfDataUri }) => {
    try {
        const base64Data = pdfDataUri.split(',')[1];
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        const loadingTask = pdfjs.getDocument({ 
            data: pdfBuffer,
            // @ts-ignore
            isEvalSupported: false,
            // @ts-ignore
            useSystemFonts: true,
        });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Get the first page

        const viewport = page.getViewport({ scale: 1.5 });
        const canvasFactory = new NodeCanvasFactory();
        const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);

        const renderContext = {
            canvasContext: context,
            viewport,
            canvasFactory,
        };

        await page.render(renderContext).promise;

        const imageDataUri = canvas.toDataURL('image/png');
        
        return { imageDataUri };
    } catch (error) {
        console.error('Error converting PDF to image:', error);
        throw new Error('Failed to process PDF file.');
    }
  }
);
