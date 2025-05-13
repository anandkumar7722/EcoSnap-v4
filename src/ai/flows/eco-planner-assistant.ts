'use server';
/**
 * @fileOverview AI assistant for eco-friendly planning and advice.
 *
 * - ecoPlannerAssistantFlow - A function that provides eco-friendly recommendations.
 * - EcoPlannerInput - The input type for the ecoPlannerAssistantFlow function.
 * - EcoPlannerOutput - The return type for the ecoPlannerAssistantFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const EcoPlannerInputSchema = z.object({
  userQuery: z.string().describe('The user query asking for eco-friendly advice, product recommendations, or event planning tips.'),
});
export type EcoPlannerInput = z.infer<typeof EcoPlannerInputSchema>;

export const EcoPlannerOutputSchema = z.object({
  recommendation: z.string().describe('The AI-generated recommendation or advice.'),
  sourceLinks: z.array(z.string().url()).optional().describe('Optional list of URLs for sources or further reading.'),
});
export type EcoPlannerOutput = z.infer<typeof EcoPlannerOutputSchema>;

export async function ecoPlannerAssistant(input: EcoPlannerInput): Promise<EcoPlannerOutput> {
  return ecoPlannerAssistantFlow(input);
}

const plannerPrompt = ai.definePrompt({
  name: 'ecoPlannerPrompt',
  input: {schema: EcoPlannerInputSchema},
  output: {schema: EcoPlannerOutputSchema},
  prompt: `You are an AI assistant specializing in eco-friendly living and sustainable practices.
A user is asking for advice. Provide helpful, actionable, and concise recommendations based on their query.

User Query: {{{userQuery}}}

Please provide a helpful recommendation. If relevant, you can suggest up to 2-3 source links for more information.
Focus on practical advice related to waste reduction, sustainable product choices, or eco-conscious event planning.
`,
});

const ecoPlannerAssistantFlow = ai.defineFlow(
  {
    name: 'ecoPlannerAssistantFlow',
    inputSchema: EcoPlannerInputSchema,
    outputSchema: EcoPlannerOutputSchema,
  },
  async (input) => {
    // In a real application, you might add logic here to call tools,
    // fetch external data, or refine the query before sending to the LLM.

    const {output} = await plannerPrompt(input);
    
    // Basic placeholder if LLM returns nothing, though output schema should enforce some structure
    if (!output) {
        return { recommendation: "I'm sorry, I couldn't generate a recommendation for that query at the moment." };
    }

    return output;
  }
);
