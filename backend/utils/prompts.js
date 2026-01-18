// Prompt template for generating interview questions
const generateQuestionsPrompt = (role, experience, topicsToFocus) => {
    return `You are an expert technical interviewer. Generate 10 challenging and relevant interview questions for the following position:

Role: ${role}
Experience Level: ${experience}
Topics to Focus: ${topicsToFocus}

Please generate questions that:
1. Are appropriate for the ${experience} experience level
2. Cover the topics: ${topicsToFocus}
3. Are realistic and commonly asked in ${role} interviews
4. Range from fundamental concepts to advanced scenarios
5. Include a mix of theoretical and practical questions

Return the questions as a JSON array in the following format:
[
  {
    "question": "Question text here"
  },
  {
    "question": "Question text here"
  }
]

Only return the JSON array, nothing else.`;
};

// Prompt template for generating an answer to a question
const generateAnswerPrompt = (question, role, experience) => {
    return `You are an expert technical interviewer helping a candidate prepare for a ${role} position at the ${experience} level.

Question: ${question}

Please provide a comprehensive, well-structured answer that:
1. Directly addresses the question
2. Is appropriate for the ${experience} experience level
3. Includes key concepts and explanations
4. Provides examples where relevant
5. Highlights important points or best practices
6. Is clear and easy to understand

Provide a detailed answer that would help the candidate understand the topic thoroughly.`;
};

module.exports = {
    generateQuestionsPrompt,
    generateAnswerPrompt,
};
