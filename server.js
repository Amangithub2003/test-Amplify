// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "amanrajwork1516@gmail.com", // 🔁 Replace with your Gmail
//     pass: "plteuuvaxxpjkzna"     // 🔁 App password from Gmail (not regular password)
//   }
// });

// // POST endpoint
// app.post("/contact", (req, res) => {
//   const { name, email, phone, message } = req.body;

//   const mailOptions = {
//     from: email,
//     to: "amanrajwork1516@gmail.com", // 🔁 Same Gmail here
//     subject: `Portfolio Message from ${name}`,
//     text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.error("Mail error:", err);
//       return res.status(500).json({ message: "❌ Failed to send message" });
//     }
//     res.status(200).json({ message: "✅ Message sent successfully!" });
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nodemailer transporter with better configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amanrajwork1516",
    pass: "gtil uevn cpjv gtnx" // Make sure this is a valid App Password
  },
  // Additional security options
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Test the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to take our messages");
  }
});

// POST endpoint with better error handling
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: "❌ Missing required fields: name, email, and message are required" 
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "❌ Invalid email format" 
      });
    }

    const mailOptions = {
      from: `"${name}" <amanrajwork1516@gmail.com>`, // Use your verified email as sender
      to: "amanrajwork1516@gmail.com",
      replyTo: email, // This allows you to reply directly to the sender
      subject: `Portfolio Contact: ${name}`,
      html: `
        <h3>New Portfolio Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`
    };

    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    
    res.status(200).json({ 
      message: "✅ Message sent successfully!",
      messageId: info.messageId 
    });

  } catch (error) {
    console.error("❌ Failed to send email:", error);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      return res.status(500).json({ 
        message: "❌ Authentication failed. Check your email credentials." 
      });
    } else if (error.code === 'ECONNECTION') {
      return res.status(500).json({ 
        message: "❌ Connection failed. Check your internet connection." 
      });
    } else {
      return res.status(500).json({ 
        message: "❌ Failed to send message. Please try again later." 
      });
    }
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server is shutting down...');
  process.exit(0);
});