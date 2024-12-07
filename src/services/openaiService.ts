import OpenAI from 'openai';
import type { DynamicQuestion } from '../types';

const openai = new OpenAI({
  apiKey: 'sk-proj-ryJTuBnQT99tQMAeOUWdL1gv7zIJq4BtMlyCq4lW7jNE9teu',
  dangerouslyAllowBrowser: true
});

export const getNextQuestion = async (previousAnswers: Array<{ question: string; response: any }>) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a medical assistant generating the next question based on previous answers.
          Return ONLY a JSON object with this structure:
          {
            "question": "the question text",
            "input_type": "text|number|date|yesno|textarea",
            "validation": {
              "required": boolean,
              "min": number (optional),
              "max": number (optional),
              "minLength": number (optional),
              "maxLength": number (optional)
            }
          }`
        },
        {
          role: "user",
          content: `Previous answers: ${JSON.stringify(previousAnswers)}. Generate the next question.`
        }
      ]
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    // Parse and validate the response
    const questionData = JSON.parse(response) as DynamicQuestion;
    return questionData;
  } catch (error) {
    console.error('Error getting next question:', error);
    // Return a default question in case of error
    return {
      question: "Y a-t-il autre chose à signaler ?",
      input_type: "textarea",
      validation: { required: true }
    };
  }
};
