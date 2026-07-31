export const executeCode = async (req, res, next) => {
  try {
    const { code, language, stdin } = req.body;
    if (!code || typeof code !== "string" || !code.trim() || !language) {
      return res.status(400).json({ success: false, message: "Code and language are required." });
    }

    const languageMap = {
      javascript: 102, // Node.js 22.08.0
      typescript: 101, // TypeScript 5.6.2
      python: 100, // Python 3.12.5
      java: 91, // Java JDK 17.0.6
      cpp: 105, // C++ GCC 14.1.0
      "c++": 105,
      c: 105,
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ success: false, message: `Language ${language} is not supported.` });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response;
    try {
      response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: stdin || "",
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return res.status(504).json({
          success: false,
          message: "Code execution timed out (limit exceeded).",
        });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const textData = await response.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      console.error("Judge0 API returned non-JSON:", textData.substring(0, 200));
      return res.status(502).json({
        success: false,
        message: "Code execution service is currently unavailable or returned an invalid response.",
        error: "Invalid response from execution engine",
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || "Failed to execute code",
        error: data,
      });
    }

    const stdout = data.stdout || "";
    const stderr = data.stderr || "";
    const compileOutput = data.compile_output || "";
    const statusMessage = data.status?.description || data.message || "";

    const combinedOutput = [stdout, stderr].filter(Boolean).join("\n") || compileOutput || statusMessage || "Execution complete with no output.";

    let formattedData;

    // Status ID 6 = Compilation Error
    if (data.status?.id === 6) {
      formattedData = {
        compile: {
          output: compileOutput || stderr || statusMessage || "Compilation Error",
        },
        run: {
          output: compileOutput || stderr || statusMessage || "Compilation Error",
          code: 1,
        },
      };
    } else {
      formattedData = {
        run: {
          output: combinedOutput,
          code: data.status?.id === 3 ? 0 : 1, // 3 = Accepted
          stderr: stderr,
          stdout: stdout,
          status: statusMessage,
        },
      };
    }

    return res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};
