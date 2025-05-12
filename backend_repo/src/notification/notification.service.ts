import { Injectable } from '@nestjs/common';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

@Injectable()
export class NotificationService {

  async mailService(data) {
    var mailOptions = {
      from: "shayankar@technoexponent.com",
      to: data.email,
      subject: 'Welcome To Puremoon',
      html: `<table id="m_2717022745648039245m_-4740547828852282236mailerPage" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;width:100%;font-size:14px;color:#1c1c1e;background-color:#fff;margin:0;padding:0" bgcolor="#fff">
      <tbody>
          <tr>
              <td valign="top" style="font-family:Arial;border-collapse:collapse">
                  <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background-color:#fff;border-radius:4px;margin-top:0;margin-bottom:0;" bgcolor="#fff">
                      <tbody>
                          <tr>
                              <td align="center" width="600" valign="top" style="padding: 15px 32px;">
                              </td>
                          </tr>
                          <tr>
                              <td width="600" valign="top">
                                  <div style="background-color: #f5f5f5;padding: 24px 42px 50px;border-radius: 10px;">
                                      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                          <tbody>
                                              <tr>
                                                  <td width="600" valign="top">
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Hello, ${data.name}</p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon! Your security is important to us. To complete your registration, please use the following One-Time Password (OTP).</p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <h3 style="margin: 0px;padding: 8px 0;color: #2f327d;font-size: 24px;font-weight: 600;">Your OTP : ${data.otp}</h3>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Please note that this OTP is valid for the next 10 minutes. if you don't verify within this time, you'll need to request a new OTP.</p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">If you didn't initiate this process, please disregard this email.
                                                      </p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon.</p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Best regards,</p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">The Puremoon Team</p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td width="600" valign="top" style="padding: 32px 0">
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td width="600" valign="top" style="padding: 24px 0 0" align="center">
                                                      <p style="margin: 0px;padding: 0 0;color: #000;font-size: 14px;font-weight: 400;">© 2025 Puremoon. All rights reserved </p>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
  
                                  </div>
                              </td>
                          </tr>
                      </tbody>
                  </table>
  
              </td>
  
          </tr>
      </tbody>
  </table>`
    };
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.log(error.response.body)
      })
  }

  async sendOtp(data) {
    var mailOptions = {
      from: "shayankar@technoexponent.com",
      to: data.email,
      subject: 'Verify OTP for Puremoon',
      html: `<table id="m_2717022745648039245m_-4740547828852282236mailerPage" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;width:100%;font-size:14px;color:#1c1c1e;background-color:#fff;margin:0;padding:0" bgcolor="#fff">
      <tbody>
          <tr>
              <td valign="top" style="font-family:Arial;border-collapse:collapse">
                  <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background-color:#fff;border-radius:4px;margin-top:0;margin-bottom:0;" bgcolor="#fff">
                      <tbody>
                          <tr>
                              <td align="center" width="600" valign="top" style="padding: 15px 32px;">
                              </td>
                          </tr>
                          <tr>
                              <td width="600" valign="top">
                                  <div style="background-color: #f5f5f5;padding: 24px 42px 50px;border-radius: 10px;">
                                      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                          <tbody>
                                              <tr>
                                                  <td width="600" valign="top">
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Hello, ${data.name}</p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon! Your security is important to us. To verify your OTP, please use the following One-Time Password (OTP).</p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <h3 style="margin: 0px;padding: 8px 0;color: #2f327d;font-size: 24px;font-weight: 600;">Your OTP : ${data.otp}</h3>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Please note that this OTP is valid for the next 10 minutes. if you don't verify within this time, you'll need to request a new OTP.</p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">If you didn't initiate this process, please disregard this email.
                                                      </p>
                                                      <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon.</p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Best regards,</p>
                                                      <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">The Puremoon Team</p>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td width="600" valign="top" style="padding: 32px 0">
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td width="600" valign="top" style="padding: 24px 0 0" align="center">
                                                      <p style="margin: 0px;padding: 0 0;color: #000;font-size: 14px;font-weight: 400;">© 2025 Puremoon. All rights reserved </p>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
  
                                  </div>
                              </td>
                          </tr>
                      </tbody>
                  </table>
  
              </td>
  
          </tr>
      </tbody>
  </table>`
    };
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.log(error.response.body)
      })
  }

  async newUserCreatedOnCheckout(data) {
    var mailOptions = {
      from: "shayankar@technoexponent.com",
      to: data.email,
      subject: 'Welcome To Puremoon',
      html: `<table id="m_2717022745648039245m_-4740547828852282236mailerPage" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;width:100%;font-size:14px;color:#1c1c1e;background-color:#fff;margin:0;padding:0" bgcolor="#fff">
        <tbody>
            <tr>
                <td valign="top" style="font-family:Arial;border-collapse:collapse">
                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background-color:#fff;border-radius:4px;margin-top:0;margin-bottom:0;" bgcolor="#fff">
                        <tbody>
                            <tr>
                                <td align="center" width="600" valign="top" style="padding: 15px 32px;">
                                </td>
                            </tr>
                            <tr>
                                <td width="600" valign="top">
                                    <div style="background-color: #f5f5f5;padding: 24px 42px 50px;border-radius: 10px;">
                                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                            <tbody>
                                                <tr>
                                                    <td width="600" valign="top">
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Hello, ${data.name}</p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon! Your security is important to us. This is your password!</p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <h3 style="margin: 0px;padding: 8px 0;color: #2f327d;font-size: 24px;font-weight: 600;">Your Password : ${data.rawPassword}</h3>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">If you didn't initiate this process, please disregard this email.
                                                        </p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon.</p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Best regards,</p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">The Puremoon Team</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="600" valign="top" style="padding: 32px 0">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="600" valign="top" style="padding: 24px 0 0" align="center">
                                                        <p style="margin: 0px;padding: 0 0;color: #000;font-size: 14px;font-weight: 400;">© 2025 Puremoon. All rights reserved </p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
    
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
    
                </td>
    
            </tr>
        </tbody>
    </table>`
    };
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.log(error.response.body)
      })
  }

  async addMemberMail(data) {
    var mailOptions = {
      from: "shayankar@technoexponent.com",
      to: data.email,
      subject: 'Welcome To Puremoon',
      html: `<table id="m_2717022745648039245m_-4740547828852282236mailerPage" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;width:100%;font-size:14px;color:#1c1c1e;background-color:#fff;margin:0;padding:0" bgcolor="#fff">
        <tbody>
            <tr>
                <td valign="top" style="font-family:Arial;border-collapse:collapse">
                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background-color:#fff;border-radius:4px;margin-top:0;margin-bottom:0;" bgcolor="#fff">
                        <tbody>
                            <tr>
                                <td align="center" width="600" valign="top" style="padding: 15px 32px;">
                                </td>
                            </tr>
                            <tr>
                                <td width="600" valign="top">
                                    <div style="background-color: #f5f5f5;padding: 24px 42px 50px;border-radius: 10px;">
                                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                            <tbody>
                                                <tr>
                                                    <td width="600" valign="top">
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Hello, ${data.name}</p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon! Your security is important to us. To complete your registration, please use the following Password.</p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <h3 style="margin: 0px;padding: 8px 0;color: #2f327d;font-size: 24px;font-weight: 600;">Your Password : ${data.password}</h3>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">If you didn't initiate this process, please disregard this email.
                                                        </p>
                                                        <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;"></p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Thank you for choosing Puremoon.</p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Best regards,</p>
                                                        <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">The Puremoon Team</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="600" valign="top" style="padding: 32px 0">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="600" valign="top" style="padding: 24px 0 0" align="center">
                                                        <p style="margin: 0px;padding: 0 0;color: #000;font-size: 14px;font-weight: 400;">© 2025 Puremoon. All rights reserved </p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
    
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
    
                </td>
    
            </tr>
        </tbody>
    </table>`
    };
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.log(error.response.body)
      })
  }

  async replyHelpCenter(data) {
    const mailOptions = {
      from: "shayankar@technoexponent.com",
      to: data.email,
      subject: "Response to Your Help Center Inquiry - Puremoon",
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;width:100%;font-size:14px;color:#1c1c1e;background-color:#fff;margin:0;padding:0" bgcolor="#fff">
          <tbody>
            <tr>
              <td valign="top" style="font-family:Arial;border-collapse:collapse">
                <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background-color:#fff;border-radius:4px;margin-top:0;margin-bottom:0;" bgcolor="#fff">
                  <tbody>
                    <tr>
                      <td align="center" width="600" valign="top" style="padding: 15px 32px;">
                        <h2 style="color: #2f327d; font-size: 22px; font-weight: 600;">Help Center Response</h2>
                      </td>
                    </tr>
                    <tr>
                      <td width="600" valign="top">
                        <div style="background-color: #f5f5f5;padding: 24px 42px 50px;border-radius: 10px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tbody>
                              <tr>
                                <td width="600" valign="top">
                                  <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Hello, ${data.name},</p>
                                  <p style="margin: 0px;padding: 8px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">We have received your query and our team has provided a response below.</p>
  
                                  <h3 style="margin: 0px;padding: 10px 0;color: #2f327d;font-size: 20px;font-weight: 600;">Your Query:</h3>
                                  <p style="background: #fff; padding: 10px; border-left: 4px solid #2f327d; color: #000;font-size: 16px; line-height: 25px; font-weight: 400;">
                                    ${data.userQuery}
                                  </p>
  
                                  <h3 style="margin: 0px;padding: 10px 0;color: #2f327d;font-size: 20px;font-weight: 600;">Our Response:</h3>
                                  <p style="background: #fff; padding: 10px; border-left: 4px solid #28a745; color: #000;font-size: 16px; line-height: 25px; font-weight: 400;">
                                    ${data.response}
                                  </p>
  
                                  <p style="margin: 0px;padding: 15px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">If you need further assistance, feel free to reply to this email or visit our <a href="https://dev.ultrasooq.com/" style="color: #2f327d; text-decoration: none;">Help Center</a>.</p>
  
                                  <p style="margin: 0px;padding: 15px 0;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">Best regards,</p>
                                  <p style="margin: 0px;padding: 0px;color: #000;font-size: 16px;line-height: 25px;font-weight: 400;">The Puremoon Team</p>
                                </td>
                              </tr>
                              <tr>
                                <td width="600" valign="top" style="padding: 32px 0">
                                </td>
                              </tr>
                              <tr>
                                <td width="600" valign="top" style="padding: 24px 0 0" align="center">
                                  <p style="margin: 0px;padding: 0 0;color: #000;font-size: 14px;font-weight: 400;">© 2025 Puremoon. All rights reserved.</p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      `,
    };
  
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log("Email sent successfully");
      })
      .catch((error) => {
        console.error("Error sending email:", error.response.body);
      });
  }
  
}
