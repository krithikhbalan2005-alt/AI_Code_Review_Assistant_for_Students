const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Code Review Endpoint
app.post('/api/review-code', async (req, res) => {
  try {
    const { language, codeText } = req.body;

    if (!language || !codeText) {
      return res.status(400).json({ error: 'Language and codeText are required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not defined.');
      return res.status(500).json({ error: 'AI review failed. Please try again later.' });
    }

    // Design the prompt for a friendly programming tutor/AI reviewer
    const prompt = `You are a supportive, friendly, and expert programming tutor and code review assistant for students.
Analyze the following code written in ${language}.
Your analysis must be returned strictly in the following JSON format:
{
  "score": <number between 0 and 100 representing code quality, syntax, and design>,
  "bugs": [<string describing syntax/logic bug 1>, <string describing syntax/logic bug 2>],
  "suggestions": [<string describing best practice / style suggestion 1>, <string describing best practice / style suggestion 2>],
  "securityIssues": [<string describing potential security vulnerability 1>, ...],
  "optimizedCode": <string containing the corrected and optimized version of the code, properly indented and using clean coding standards. If no optimizations needed, return the original code>,
  "complexityAnalysis": <string with brief time and space complexity explanations, e.g. "Time Complexity: O(n), Space Complexity: O(1) because...">,
  "beginnerExplanation": <string containing a simple, friendly, easy-to-understand tutorial explanation of how the code works, what issues were found, and why the corrections help their learning>
}

Important Instructions:
1. Do not run, execute, or compile the code. Treat it strictly as text.
2. Ensure the response is valid JSON.
3. Be supportive, positive, and encourage the student. Keep explanations easy for beginners.
4. If the code is empty or not code at all (just gibberish), return a score of 0, list bugs explaining that valid code is needed, and encourage them to paste valid code.

Code to analyze:
${codeText}`;

    // Call the Gemini 1.5 Flash API using native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API call failed:', errorText);
      return res.status(500).json({ error: 'AI review failed. Please try again later.' });
    }

    const responseData = await response.json();
    
    // Safely parse response content
    const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error('Invalid response format from Gemini API:', responseData);
      return res.status(500).json({ error: 'AI review failed. Please try again later.' });
    }

    // Clean and parse JSON
    let parsedResult;
    try {
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsedResult = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini response text:', responseText, parseError);
      return res.status(500).json({ error: 'AI review failed. Please try again later.' });
    }

    // Verify all necessary keys exist, fallback if not
    const finalResult = {
      score: typeof parsedResult.score === 'number' ? parsedResult.score : 70,
      bugs: Array.isArray(parsedResult.bugs) ? parsedResult.bugs : [],
      suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : [],
      securityIssues: Array.isArray(parsedResult.securityIssues) ? parsedResult.securityIssues : [],
      optimizedCode: typeof parsedResult.optimizedCode === 'string' ? parsedResult.optimizedCode : codeText,
      complexityAnalysis: typeof parsedResult.complexityAnalysis === 'string' ? parsedResult.complexityAnalysis : 'Complexity analysis not available.',
      beginnerExplanation: typeof parsedResult.beginnerExplanation === 'string' ? parsedResult.beginnerExplanation : 'No beginner explanation available.'
    };

    return res.json(finalResult);
  } catch (error) {
    console.error('Unhandled server error during code review:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Review server is running on port ${PORT}`);
});
