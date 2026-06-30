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
    
    // Fallback Mock Review when API key is not configured or is a placeholder
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.log('Simulating AI code review response (API key is placeholder).');
      
      const mockResult = {
        score: 82,
        bugs: [
          `Detected structural pattern for language: ${language}.`,
          "Double check range boundaries and index conditions to prevent off-by-one errors."
        ],
        suggestions: [
          "Document your functions using headers or comment blocks describing parameters.",
          "Declare variables with descriptive terms instead of brief single-character shortcuts."
        ],
        securityIssues: [
          "No immediate safety vulnerabilities found in this snippet. Ensure dynamic inputs are sanitized."
        ],
        optimizedCode: codeText,
        complexityAnalysis: "Time Complexity: O(N) typical iteration traversal.\nSpace Complexity: O(1) auxiliary variable space.",
        beginnerExplanation: `Hey student! Your code written in ${language} is a solid start. To make it even better, try renaming variables to descriptive names and add docstrings/comments so others can read your work. Keep practicing!`
      };

      // Mock tutor optimization for calculate_average
      if (language === 'Python' && (codeText.includes('calculate_average') || codeText.includes('marks'))) {
        mockResult.score = 85;
        mockResult.bugs = [
          "IndexError: list index out of range. The loop 'range(len(marks) + 1)' accesses an index equal to the list size, which causes a crash."
        ];
        mockResult.suggestions = [
          "Change the range limits from 'range(len(marks) + 1)' to 'range(len(marks))' to avoid boundary errors.",
          "Instead of manual looping, you can simplify the logic by using Python's built-in sum() function: 'sum(marks) / len(marks)'."
        ];
        mockResult.optimizedCode = `def calculate_average(marks):
    total = 0
    
    # Corrected loop bounds to avoid IndexError
    for i in range(len(marks)):
        total += marks[i]
        
    average = total / len(marks)
    return average

student_marks = [80, 90, 75, 85]
print("Average:", calculate_average(student_marks))`;
        mockResult.complexityAnalysis = "Time Complexity: O(N) where N is the number of elements.\nSpace Complexity: O(1) auxiliary variable space.";
        mockResult.beginnerExplanation = "Hello student! Your function calculate_average contains a common index bug: in Python, list indexes start at 0 and end at len(marks) - 1. By looping over range(len(marks) + 1), your code attempts to access marks[len(marks)], which does not exist and throws an IndexError. Removing '+ 1' fixes this perfectly! You can also use sum(marks) / len(marks) for a cleaner solution.";
      }
      // Mock tutor optimization for a standard loop sum program in Python
      else if (language === 'Python' && (codeText.includes('for i in range') || codeText.includes('calculate_sum'))) {
        mockResult.score = 95;
        mockResult.bugs = ["Manual looping is slower than mathematical direct calculations or built-in range operators."];
        mockResult.suggestions = [
          "Utilize Python's sum() and range() built-in functions for high performance.",
          "Use arithmetic series sum formula (n * (n - 1) / 2) for constant time execution."
        ];
        mockResult.optimizedCode = "def calculate_sum(n):\n    \"\"\"Sum numbers up to n-1 using standard range sum functionality.\"\"\"\n    return sum(range(n))";
        mockResult.complexityAnalysis = "Time Complexity: O(1) using algebraic summation (or O(N) built-in loop optimizations).\nSpace Complexity: O(1) space.";
        mockResult.beginnerExplanation = "Hello! Instead of writing a manual 'for' loop to add numbers, Python offers a built-in sum() function. Using sum(range(n)) runs much faster because it executes optimized code under the hood. For even faster execution, you can calculate the sum in constant time using standard algebra!";
      }


      return res.json(mockResult);
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
  "optimizedCode": <string containing the COMPLETE corrected and optimized version of the entire submitted code file, properly formatted and indented. Do NOT just return the modified lines, changed functions, or diff blocks; you MUST return the FULL code file in its entirety with the corrections applied, so the student can easily copy and paste the entire file. If no changes are needed, return the original code in full.>,
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
