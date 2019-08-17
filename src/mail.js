const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const makeANiceEmail = text => `
  <div className="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
    <h2>Hello There!</h2>
    <p>${text}</p>
    <p>😘, Justin McIntosh</p>
  </div>
`;

const welcomeEmail = text => `
<html>
  <head>
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentsettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentsettings>
      </xml>
    <![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="address=no">
    <meta name="format-detection" content="telephone=no">
    <meta name="format-detection" content="email=no">
    <meta name="x-apple-disable-message-reformatting">    <!--[if !mso]>
      <!-->
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i%7CMerriweather:400,400i,700,700i%7CMontserrat:400,400i,700,700i%7CMontserrat+Alternates:400,400i,700,700i%7COpen+Sans:400,400i,700,700i%7CPT+Sans:400,400i,700,700i%7CRaleway:400,400i,700,700i%7CRoboto:400,400i,700,700i%7CSource+Sans+Pro:400,400i,700,700i%7CRoboto+Slab:400,700%7CUbuntu:400,400i,700,700i%7CTitillium+Web:400,400i,700,700i%7CNunito:400,400i,700,700i%7CCabin:400,400i,700,700i%7CExo:400,400i,700,700i%7CComfortaa:400,700%7CRaleway:400,400i,700,700i%7COxygen:400,700');
      </style>
    <!--<![endif]-->
    <!-- RSS STYLE STARTS -->
    <!--[if mso]>
      <style type="text/css">
        .content-MS .content img { width: 560px; }
      </style>
    <![endif]-->
    <!-- WINDOWS 10 HACKS FOR LINK AND BG COLOR -->
    <!--[if (mso)|(mso 16)]>
      <style type="text/css">
        .mlContentButton a { text-decoration: none; }
      </style>
    <![endif]-->
    <!--[if !mso]>
      <!-- -->
      <style type="text/css">
        .mlBodyBackgroundImage { background-image: url(''); }
      </style>
    <!--<![endif]-->
    <!--[if (lt mso 16)]>
      <style type="text/css">
        .mlBodyBackgroundImage { background-image: url(''); }
      </style>
    <![endif]-->
    <style type="text/css">
      .ReadMsgBody { width: 100%; }  	.ExternalClass{ width: 100%; }  	.ExternalClass * { line-height: 100%; }  	.ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font { line-height:100%; }  	body { margin: 0; padding: 0; }  	body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }  	table td { border-collapse: collapse; }  	table { border-spacing: 0; border-collapse: collapse; }  	p, a, li, td, blockquote { mso-line-height-rule: exactly; }  	p, a, li, td, body, table, blockquote { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }  	img, a img { border: 0; outline: none; text-decoration: none; }  	img { -ms-interpolation-mode: bicubic; }  	* img[tabindex="0"] + div { display: none !important; }  	a[href^=tel],a[href^=sms],a[href^=mailto], a[href^=date] { color: inherit; cursor: pointer; text-decoration: none; }  	a[x-apple-data-detectors]{ color: inherit!important; text-decoration: none!important; font-size: inherit!important; font-family: inherit!important; font-weight: inherit!important; line-height: inherit!important; }  	#MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }    #MessageViewBody { width: 100% !important; }  	#MessageWebViewDiv { width: 100% !important; }    	@-moz-document url-prefix() {   		.bodyText p a, .bodyTitle p a {  			word-break: break-word;  		}  	}    	@media screen {  		body {  			font-family: 'Open Sans', Arial, Helvetica, sans-serif;  		}  	}    	@media only screen and (min-width:768px){  		.mlEmailContainer{  			width: 640px!important;  		}  	}  	  	@media only screen and (max-width: 640px) {  		.mlTemplateContainer{  			padding: 10px 10px 0 10px;  		}  		.mlTemplateContainer{  			padding: 10px 10px 0 10px;  		}  		/* -- */  		.mlContentCenter{  			min-width: 10%!important;  			margin: 0!important;  			float: none!important;  		}  		/* -- */  		.mlContentTable{  			width: 100%!important;  			min-width: 10%!important;  			margin: 0!important;  			float: none!important;  		}  		/* -- */  		.mlContentBlock{  			display: block !important;  			width: 100%!important;  			min-width: 10%!important;  			margin: 0!important;  			float: none!important;  		}  		/* -- */  		.mlContentOuter{  			padding-bottom: 0px!important;  			padding-left: 15px!important;  			padding-right: 15px!important;  			padding-top: 0px!important;  		}  		/* -- */  		.mlMenuOuter{  			padding-bottom: 0px!important;  			padding-left: 5px!important;  			padding-right: 5px!important;  			padding-top: 0px!important;  		}  		/* -- */  		.mlContentOuterFullBig{  			padding: 30px!important;  		}  		/* -- */  		.mlContentImage img {  			height: auto!important;  			width: 100%!important;  		}  		/* -- */  		.mlContentImage160 img {  			height: auto!important;  			max-width: 160px;  			width: 100%!important;  		}  		/* -- */  		.mlContentImage260 img {  			height: auto!important;  			max-width: 260px;  			width: 100%!important;  		}  		/* -- */  		.mlContentImage{  			height: 100%!important;  			width: auto!important;  		}  		/* -- */  		.mlContentButton a{  			display: block!important;  			width: auto!important;  		}  		/* -- */  		.spacingHeight-20{  			height: 10px!important;  		}  		/* -- */  		.spacingHeight-30{  			height: 15px!important;  		}  		/* -- */  		.spacingHeight-40{  			height: 20px!important;  		}  		/* -- */  		.spacingHeight-50{  			height: 25px!important;  		}  		/* -- */  		.spacingHeight-60{  			height: 30px!important;  		}  		/* -- */  		.spacingHeight-70{  			height: 35px!important;  		}  		/* -- */  		.spacingHeight-80{  			height: 40px!important;  		}  		/* -- */  		.spacingHeight-90{  			height: 45px!important;  		}  		/* -- */  		.spacingHeight-100{  			height: 50px!important;  		}  		/* -- */  		.spacingWidth-20{  			width: 10px!important;  		}  		/* -- */  		.spacingWidth-30{  			width: 15px!important;  		}  		/* -- */  		.spacingWidth-40{  			width: 20px!important;  		}  		/* -- */  		.spacingWidth-60{  			width: 30px!important;  		}  		/* -- */  		.mobileHide{  			display: none!important;  		}  		/* -- */  		.alignCenter{  			height: auto!important;  			text-align: center!important;  		}  		/* -- */  		.alignCenter img{  			display: inline !important;  			text-align: center!important;  		}  		/* -- */  		.marginBottom{  			margin-bottom: 15px!important;  		}  		/* -- */  		.mlContentHeight{  			height: auto!important;  		}  		/* -- */  		.mlDisplayInline {  			display: inline-block!important;  			float: none!important;  		}  		/* -- */  		.mlNoFloat{  			float: none!important;  			margin-left: auto!important;  			margin-right: auto!important;  		}      /* -- */      .mlContentSurvey{        float: none!important;        margin-bottom: 10px!important;        width:100%!important;      }      /* -- */      .mlContentSurvey td a{        width: auto!important;      }      /* -- */      .multiple-choice-item-table{        width: 100% !important;        margin-bottom: 20px !important;        min-width: 10% !important;        float: none !important;      }  		/* -- */  		body{  			margin: 0px!important;  			padding: 0px!important;  		}  		/* -- */  		body, table, td, p, a, li, blockquote{  			-webkit-text-size-adjust: none!important;  		}  	}  	@media only screen and (max-width: 480px){  		.social-LinksTable{   			width: 100%!important;   		}  		/* -- */  		.social-LinksTable td:first-child{   			padding-left: 0px!important;   		}  		/* -- */  		.social-LinksTable td:last-child{   			padding-right: 0px!important;   		}  		/* -- */  		.social-LinksTable td{   			padding: 0 10px!important;   		}  		/* -- */  		.social-LinksTable td img{   			height: auto!important;   			max-width: 48px;   			width: 100%!important;   		}  		/* -- */  	}
    </style>
    <!--[if mso]>
      <style type="text/css">
        .bodyText { font-family: Arial, Helvetica, sans-serif!important ; }  	.bodyText * { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText a { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText a span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText p { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText ul li { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle { font-family: Arial, Helvetica, sans-serif!important ; }  	.bodyTitle * { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle a { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle a span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle p { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont { font-family: Arial, Helvetica, sans-serif!important ; }  	.bodyFont * { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont a { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont a span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont p { font-family: Arial, Helvetica, sans-serif!important; }  	.mlContentButton { font-family: Arial, Helvetica, sans-serif!important; }
      </style>
    <![endif]-->
    <style type="text/css">
      @media only screen and (max-width: 640px){         		#logoBlock-5 {         			max-width: 190px!important;         			width: 100%!important;         		}         	}
    </style>
    <style type="text/css">
      @media only screen and (max-width: 640px){ 					#imageBlock-6 img { 						max-width: 5128px!important; 						width: 100%!important; 					} 				}
    </style>
    <title>Welcome to Entra!</title>
    <meta name="robots" content="noindex, nofollow">
  </head>

  <body class="mlBodyBackground" style="padding: 0; margin: 0; -webkit-font-smoothing:antialiased; background-color:#f6f6f6; -webkit-text-size-adjust:none;">
    <!--[if !mso]>
      <!-- -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f6f6f6" class="mainTable mlBodyBackground" dir="ltr" background="">
        <tr>
          <td class="mlTemplateContainer" align="center">
          <!--<![endif]-->
          <!--[if mso 16]>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
              <tr>
                <td bgcolor="#f6f6f6" align="center">
                <!--<![endif]-->
                <!-- Content starts here -->
                <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mobileHide">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                        <tr>
                          <td colspan="2" height="20"></td>
                        </tr>
                        <tr>
                          <td align="left" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; color: #111111; font-size: 12px; line-height: 18px;"></td>
                          <td align="right" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; color: #111111; font-size: 12px; line-height: 18px;">

                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" height="20"></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table align="center" border="0" cellpadding="0" cellspacing="0" class="mlContentTable" width="640">
                  <tr>
                    <td>
                      <!--  -->
                      <table align="center" border="0" bgcolor="#F2F4EF" class="mlContentTable mlContentTableDefault" cellpadding="0" cellspacing="0" width="640">
                        <tr>
                          <td class="mlContentTableCardTd">
                            <table align="center" bgcolor="#F2F4EF" border="0" cellpadding="0" cellspacing="0" class="mlContentTable ml-default" style="width: 640px; min-width: 640px;" width="640">
                              <tr>
                                <td>
                                  <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                    <tr>
                                      <td height="40" class="spacingHeight-40" style="line-height: 40px; min-height: 40px;"></td>
                                    </tr>
                                  </table>
                                  <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                    <tr>
                                      <td align="center" style="padding: 0px 40px;" class="mlContentOuter">
                                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                          <tr>
                                            <td align="center">
                                              <a href="http://entra.io/"  target="_blank"><img src="https://bucket.mlcdn.com/a/1614/1614108/images/123210c54cace44c905d9980582846fca5fe59d6.jpeg/900967468b15bc0bba9c0cf23cd5b1682ae8900f.jpeg" id="logoBlock-5" width="190" border="0" alt="" style="display: block;"></a>
                                            </td>
                                          </tr>
                                        </table>
                                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                          <tr>
                                            <td height="70" class="spacingHeight-50"></td>
                                          </tr>
                                        </table>
                                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                          <tr>
                                            <td align="center" class="bodyTitle" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 28px; font-weight: 700; line-height: 34px; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">Thanks for signing up! ${text}</td>
                                          </tr>
                                          <tr>
                                            <td height="40" class="spacingHeight-40"></td>
                                          </tr>
                                          <tr>
                                            <td align="center" id="imageBlock-6">
                                              <img src="https://bucket.mlcdn.com/a/1614/1614108/images/272f1c0c7b9eb0bbbe011dc5aa90c84b7c44477c.jpeg" border="0" width="560" style="display: block;">
                                            </td>
                                          </tr>
                                          <tr>
                                            <td height="40" class="spacingHeight-40"></td>
                                          </tr>
                                          <tr>
                                            <td align="left" class="bodyTitle" id="bodyText-6" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 24px; color: #6f6f6f;">
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px; text-align: center;"><span style="font-size: 20px; color: rgb(133, 189, 203);"><strong><u>COOL STUFF COMING</u></strong></span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px; text-align: center;"><span style="font-size: 26px;"><br></span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px; text-align: center;"><span style="font-size: 26px;"><span style="color: rgb(133, 189, 203);"></span>Our Why</span><span style="font-size: 16px;"><br></span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px;"><span style="font-size: 16px;">We connect entrepreneurs so they can inspire, learn, and grow from one another.&nbsp;</span><span style="font-size: 26px;"><br></span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px; text-align: center;"><span style="font-size: 26px;">Our Solution</span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px;"><span style="font-size: 16px;">We built a platform to support the entrepreneur community with incredible Business Stories, Question and Answer Sections, and Tools to help you succeed. &nbsp;</span><span style="font-size: 16px;">&nbsp;</span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px;"></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px; text-align: center;"><span style="font-size: 26px;">Our Promise</span></p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px;"><span style="font-size: 16px;"></span><span style="font-size: 16px;">We believe that the world would be a better place if more people took the plunge and started businesses. We are here to help.<br></span></p>
                                              <p style="margin-top: 0px; margin-bottom: 0px; line-height: 24px; text-align: center;"><span style="font-size: 22px;"><br></span></p>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                    <tr>
                                      <td height="20" class="spacingHeight-20" style="line-height: 20px; min-height: 20px;"></td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!--  -->
                      <table align="center" border="0" bgcolor="#ffffff" class="mlContentTable mlContentTableFooterDefault" cellpadding="0" cellspacing="0" width="640">
                        <tr>
                          <td class="mlContentTableFooterCardTd">
                            <table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" class="mlContentTable ml-default" style="width: 640px; min-width: 640px;" width="640">
                              <tr>
                                <td>
                                  <selector>
                                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                      <tr>
                                        <td height="70" class="spacingHeight-70" style="line-height: 70px; min-height: 70px;"></td>
                                      </tr>
                                    </table>
                                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                      <tr>
                                        <td align="center" style="padding: 0px 150px;" class="mlContentOuter">
                                          <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                            <tr>
                                              <td align="center">
                                                <table cellpadding="0" cellspacing="0" border="0" align="center">
                                                  <tr>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjE3NTY2Mjk1MTc2Nzc5Njk1JmM9cTJzNiZiPTI2NzY2ODQ5OCZkPWs1bDlhNHE=.FV3EZWE2rln-HNkgjxKxoH6DjbPyFPNF7yjgoa3jqXA" data-link-id="267668498" target="_blank"> 										<img width="39" alt="facebook" src="https://bucket.mlcdn.com/images/icons/default/round/grey/facebook.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjE3NTY2Mjk1MTc2Nzc5Njk1JmM9cTJzNiZiPTI2NzY2ODUwMCZkPXozaDVsOGo=.8iY-o1zMUfWxrgN97SUTnjGbtdLkXtEdCEs95JHw_ZM" data-link-id="267668500" target="_blank"> 										<img width="39" alt="instagram" src="https://bucket.mlcdn.com/images/icons/default/round/grey/instagram.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjE3NTY2Mjk1MTc2Nzc5Njk1JmM9cTJzNiZiPTI2NzY2ODUwMiZkPWcwazF1MHE=.iKOoCH9Md95NfbZLtFt-qeSNcLVi3a11YIS_kOMr19s" data-link-id="267668502" target="_blank"> 										<img width="39" alt="linkedin" src="https://bucket.mlcdn.com/images/icons/default/round/grey/linkedin.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjE3NTY2Mjk1MTc2Nzc5Njk1JmM9cTJzNiZiPTI2NzY2ODUwNCZkPXg2eDlsMmc=.FdJG2a9VXPy7TGrsfBOZ0zkcFbvu-JS_C7PuU8-iHCQ" data-link-id="267668504" target="_blank"> 										<img width="39" alt="twitter" src="https://bucket.mlcdn.com/images/icons/default/round/grey/twitter.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="20" class="spacingHeight-20"></td>
                                            </tr>
                                            <tr>
                                              <td align="center" class="bodyTitle" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700; line-height: 20px; color: #111111;">Entra</td>
                                            </tr>
                                            <tr>
                                              <td align="center" class="bodyTitle" id="footerText-8" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; color: #111111;">
                                                <p style="margin-top: 0px; margin-bottom: 0px;">2689 Via De La Valle, Unit F, Del Mar<br>United States</p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="25" class="spacingHeight-20"></td>
                                            </tr>
                                            <tr>
                                              <td align="center" class="bodyTitle" id="footerUnsubscribeText-8" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; color: #111111;">
                                                <p style="margin-top: 0px; margin-bottom: 0px;">You received this email because you signed up on our Entra.</p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="10"></td>
                                            </tr>
                                            <tr>

                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                      <tr>
                                        <td height="40" class="spacingHeight-40" style="line-height: 40px; min-height: 40px;"></td>
                                      </tr>
                                    </table>
                                  </selector>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                  <tr>
                    <td height="40" class="spacingHeight-20"></td>

                    <td height="40" class="spacingHeight-20"></td>
                  </tr></table>
                <!-- Content ends here -->
                <!--[if mso 16]>
                </td>
              </tr>
            </table>
          <!--<![endif]-->
          <!--[if !mso]>
            <!-- -->
          </td>
        </tr>
      </table>
    <!--<![endif]-->
  </body>

</html>
`;

const resetEmail = (name, text) => `

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2//EN">
<html>

  <head>
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentsettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentsettings>
      </xml>
    <![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="address=no">
    <meta name="format-detection" content="telephone=no">
    <meta name="format-detection" content="email=no">
    <meta name="x-apple-disable-message-reformatting">    <!--[if !mso]>
      <!-->
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i%7CMerriweather:400,400i,700,700i%7CMontserrat:400,400i,700,700i%7CMontserrat+Alternates:400,400i,700,700i%7COpen+Sans:400,400i,700,700i%7CPT+Sans:400,400i,700,700i%7CRaleway:400,400i,700,700i%7CRoboto:400,400i,700,700i%7CSource+Sans+Pro:400,400i,700,700i%7CRoboto+Slab:400,700%7CUbuntu:400,400i,700,700i%7CTitillium+Web:400,400i,700,700i%7CNunito:400,400i,700,700i%7CCabin:400,400i,700,700i%7CExo:400,400i,700,700i%7CComfortaa:400,700%7CRaleway:400,400i,700,700i%7COxygen:400,700');
      </style>
    <!--<![endif]-->
    <!-- RSS STYLE STARTS -->
    <!--[if mso]>
      <style type="text/css">
        .content-MS .content img { width: 560px; }
      </style>
    <![endif]-->
    <!-- WINDOWS 10 HACKS FOR LINK AND BG COLOR -->
    <!--[if (mso)|(mso 16)]>
      <style type="text/css">
        .mlContentButton a { text-decoration: none; }
      </style>
    <![endif]-->
    <!--[if !mso]>
      <!-- -->
      <style type="text/css">
        .mlBodyBackgroundImage { background-image: url(''); }
      </style>
    <!--<![endif]-->
    <!--[if (lt mso 16)]>
      <style type="text/css">
        .mlBodyBackgroundImage { background-image: url(''); }
      </style>
    <![endif]-->
    <style type="text/css">
      .ReadMsgBody { width: 100%; }  	.ExternalClass{ width: 100%; }  	.ExternalClass * { line-height: 100%; }  	.ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font { line-height:100%; }  	body { margin: 0; padding: 0; }  	body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }  	table td { border-collapse: collapse; }  	table { border-spacing: 0; border-collapse: collapse; }  	p, a, li, td, blockquote { mso-line-height-rule: exactly; }  	p, a, li, td, body, table, blockquote { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }  	img, a img { border: 0; outline: none; text-decoration: none; }  	img { -ms-interpolation-mode: bicubic; }  	* img[tabindex="0"] + div { display: none !important; }  	a[href^=tel],a[href^=sms],a[href^=mailto], a[href^=date] { color: inherit; cursor: pointer; text-decoration: none; }  	a[x-apple-data-detectors]{ color: inherit!important; text-decoration: none!important; font-size: inherit!important; font-family: inherit!important; font-weight: inherit!important; line-height: inherit!important; }  	#MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }    #MessageViewBody { width: 100% !important; }  	#MessageWebViewDiv { width: 100% !important; }    	@-moz-document url-prefix() {   		.bodyText p a, .bodyTitle p a {  			word-break: break-word;  		}  	}    	@media screen {  		body {  			font-family: 'Open Sans', Arial, Helvetica, sans-serif;  		}  	}    	@media only screen and (min-width:768px){  		.mlEmailContainer{  			width: 640px!important;  		}  	}  	  	@media only screen and (max-width: 640px) {  		.mlTemplateContainer{  			padding: 10px 10px 0 10px;  		}  		.mlTemplateContainer{  			padding: 10px 10px 0 10px;  		}  		/* -- */  		.mlContentCenter{  			min-width: 10%!important;  			margin: 0!important;  			float: none!important;  		}  		/* -- */  		.mlContentTable{  			width: 100%!important;  			min-width: 10%!important;  			margin: 0!important;  			float: none!important;  		}  		/* -- */  		.mlContentBlock{  			display: block !important;  			width: 100%!important;  			min-width: 10%!important;  			margin: 0!important;  			float: none!important;  		}  		/* -- */  		.mlContentOuter{  			padding-bottom: 0px!important;  			padding-left: 15px!important;  			padding-right: 15px!important;  			padding-top: 0px!important;  		}  		/* -- */  		.mlMenuOuter{  			padding-bottom: 0px!important;  			padding-left: 5px!important;  			padding-right: 5px!important;  			padding-top: 0px!important;  		}  		/* -- */  		.mlContentOuterFullBig{  			padding: 30px!important;  		}  		/* -- */  		.mlContentImage img {  			height: auto!important;  			width: 100%!important;  		}  		/* -- */  		.mlContentImage160 img {  			height: auto!important;  			max-width: 160px;  			width: 100%!important;  		}  		/* -- */  		.mlContentImage260 img {  			height: auto!important;  			max-width: 260px;  			width: 100%!important;  		}  		/* -- */  		.mlContentImage{  			height: 100%!important;  			width: auto!important;  		}  		/* -- */  		.mlContentButton a{  			display: block!important;  			width: auto!important;  		}  		/* -- */  		.spacingHeight-20{  			height: 10px!important;  		}  		/* -- */  		.spacingHeight-30{  			height: 15px!important;  		}  		/* -- */  		.spacingHeight-40{  			height: 20px!important;  		}  		/* -- */  		.spacingHeight-50{  			height: 25px!important;  		}  		/* -- */  		.spacingHeight-60{  			height: 30px!important;  		}  		/* -- */  		.spacingHeight-70{  			height: 35px!important;  		}  		/* -- */  		.spacingHeight-80{  			height: 40px!important;  		}  		/* -- */  		.spacingHeight-90{  			height: 45px!important;  		}  		/* -- */  		.spacingHeight-100{  			height: 50px!important;  		}  		/* -- */  		.spacingWidth-20{  			width: 10px!important;  		}  		/* -- */  		.spacingWidth-30{  			width: 15px!important;  		}  		/* -- */  		.spacingWidth-40{  			width: 20px!important;  		}  		/* -- */  		.spacingWidth-60{  			width: 30px!important;  		}  		/* -- */  		.mobileHide{  			display: none!important;  		}  		/* -- */  		.alignCenter{  			height: auto!important;  			text-align: center!important;  		}  		/* -- */  		.alignCenter img{  			display: inline !important;  			text-align: center!important;  		}  		/* -- */  		.marginBottom{  			margin-bottom: 15px!important;  		}  		/* -- */  		.mlContentHeight{  			height: auto!important;  		}  		/* -- */  		.mlDisplayInline {  			display: inline-block!important;  			float: none!important;  		}  		/* -- */  		.mlNoFloat{  			float: none!important;  			margin-left: auto!important;  			margin-right: auto!important;  		}      /* -- */      .mlContentSurvey{        float: none!important;        margin-bottom: 10px!important;        width:100%!important;      }      /* -- */      .mlContentSurvey td a{        width: auto!important;      }      /* -- */      .multiple-choice-item-table{        width: 100% !important;        margin-bottom: 20px !important;        min-width: 10% !important;        float: none !important;      }  		/* -- */  		body{  			margin: 0px!important;  			padding: 0px!important;  		}  		/* -- */  		body, table, td, p, a, li, blockquote{  			-webkit-text-size-adjust: none!important;  		}  	}  	@media only screen and (max-width: 480px){  		.social-LinksTable{   			width: 100%!important;   		}  		/* -- */  		.social-LinksTable td:first-child{   			padding-left: 0px!important;   		}  		/* -- */  		.social-LinksTable td:last-child{   			padding-right: 0px!important;   		}  		/* -- */  		.social-LinksTable td{   			padding: 0 10px!important;   		}  		/* -- */  		.social-LinksTable td img{   			height: auto!important;   			max-width: 48px;   			width: 100%!important;   		}  		/* -- */  	}
    </style>
    <!--[if mso]>
      <style type="text/css">
        .bodyText { font-family: Arial, Helvetica, sans-serif!important ; }  	.bodyText * { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText a { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText a span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText p { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyText ul li { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle { font-family: Arial, Helvetica, sans-serif!important ; }  	.bodyTitle * { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle a { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle a span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyTitle p { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont { font-family: Arial, Helvetica, sans-serif!important ; }  	.bodyFont * { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont a { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont a span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont span { font-family: Arial, Helvetica, sans-serif!important; }  	.bodyFont p { font-family: Arial, Helvetica, sans-serif!important; }  	.mlContentButton { font-family: Arial, Helvetica, sans-serif!important; }
      </style>
    <![endif]-->
    <style type="text/css">
      @media only screen and (max-width: 640px){         		#logoBlock-5 {         			max-width: 190px!important;         			width: 100%!important;         		}         	}
    </style>
    <style type="text/css">
      @media only screen and (max-width: 640px){ 					#imageBlock-6 img { 						max-width: 380px!important; 						width: 100%!important; 					} 				}
    </style>
    <title>Welcome to Entra!</title>
    <meta name="robots" content="noindex, nofollow">
  </head>

  <body class="mlBodyBackground" style="padding: 0; margin: 0; -webkit-font-smoothing:antialiased; background-color:#f6f6f6; -webkit-text-size-adjust:none;">
    <!--[if !mso]>
      <!-- -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f6f6f6" class="mainTable mlBodyBackground" dir="ltr" background="">
        <tr>
          <td class="mlTemplateContainer" align="center">
          <!--<![endif]-->
          <!--[if mso 16]>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
              <tr>
                <td bgcolor="#f6f6f6" align="center">
                <!--<![endif]-->
                <!-- Content starts here -->
                <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mobileHide">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                        <tr>
                          <td colspan="2" height="20"></td>
                        </tr>
                        <tr>
                          <td align="left" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; color: #111111; font-size: 12px; line-height: 18px;"></td>
                          <td align="right" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; color: #111111; font-size: 12px; line-height: 18px;">
                            <a style="color: #111111;" href="https://click.mailerlite.com/link/c/YT0xMjI0NzIzMDk5NDM0MzU3OTI5JmM9YzFqOSZiPTI3MDczNjU2OCZkPXcxazd0Nm0=.S9hCEnOCVQ8RTRSI9iLYy-c4BjHkcWRnU83_WJUQfDc" data-link-id="270736568" target="_blank">View in browser</a>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" height="20"></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table align="center" border="0" cellpadding="0" cellspacing="0" class="mlContentTable" width="640">
                  <tr>
                    <td>
                      <!--  -->
                      <table align="center" border="0" bgcolor="#F2F4EF" class="mlContentTable mlContentTableDefault" cellpadding="0" cellspacing="0" width="640">
                        <tr>
                          <td class="mlContentTableCardTd">
                            <table align="center" bgcolor="#F2F4EF" border="0" cellpadding="0" cellspacing="0" class="mlContentTable ml-default" style="width: 640px; min-width: 640px;" width="640">
                              <tr>
                                <td>
                                  <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                    <tr>
                                      <td height="40" class="spacingHeight-40" style="line-height: 40px; min-height: 40px;"></td>
                                    </tr>
                                  </table>
                                  <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                    <tr>
                                      <td align="center" style="padding: 0px 40px;" class="mlContentOuter">
                                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                          <tr>
                                            <td align="center">
                                              <a href="https://click.mailerlite.com/link/c/YT0xMjI0NzIzMDk5NDM0MzU3OTI5JmM9YzFqOSZiPTI3MDczNjU3MCZkPWg0bjFpNWg=.TCU0Kt3FHtml2u7GSN4eRyjHKCvpV8e5ExVyEFssBEM" data-link-id="270736570" target="_blank"><img src="https://bucket.mlcdn.com/a/1614/1614108/images/123210c54cace44c905d9980582846fca5fe59d6.jpeg/900967468b15bc0bba9c0cf23cd5b1682ae8900f.jpeg" id="logoBlock-5" width="190" border="0" alt="" style="display: block;"></a>
                                            </td>
                                          </tr>
                                        </table>
                                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                          <tr>
                                            <td height="70" class="spacingHeight-50"></td>
                                          </tr>
                                        </table>
                                        <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                          <tr>
                                            <td align="center" class="bodyTitle" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 28px; font-weight: 700; line-height: 34px; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">Hi ${name},</td>
                                          </tr>
                                          <tr>
                                            <td height="40" class="spacingHeight-40"></td>
                                          </tr>
                                          <tr>
                                            <td align="left" class="bodyTitle" id="bodyText-6" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 24px; color: #6f6f6f;">
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px;">${text}</p>
                                              <p style="margin-top: 0px; margin-bottom: 10px; line-height: 24px;">Thanks,&nbsp;</p>
                                              <p style="margin-top: 0px; margin-bottom: 0px; line-height: 24px;">Justin McIntosh CEO</p>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                    <tr>
                                      <td height="20" class="spacingHeight-20" style="line-height: 20px; min-height: 20px;"></td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!--  -->
                      <table align="center" border="0" bgcolor="#ffffff" class="mlContentTable mlContentTableFooterDefault" cellpadding="0" cellspacing="0" width="640">
                        <tr>
                          <td class="mlContentTableFooterCardTd">
                            <table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" class="mlContentTable ml-default" style="width: 640px; min-width: 640px;" width="640">
                              <tr>
                                <td>
                                  <selector>
                                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                      <tr>
                                        <td height="70" class="spacingHeight-70" style="line-height: 70px; min-height: 70px;"></td>
                                      </tr>
                                    </table>
                                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                      <tr>
                                        <td align="center" style="padding: 0px 150px;" class="mlContentOuter">
                                          <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
                                            <tr>
                                              <td align="center">
                                                <table cellpadding="0" cellspacing="0" border="0" align="center">
                                                  <tr>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjI0NzIzMDk5NDM0MzU3OTI5JmM9YzFqOSZiPTI3MDczNjU3MiZkPXEzcDlpNGE=.7uBfPpvXF8ovFXHtMy7yXceypsGaCa3zhM3hMRbqRKc" data-link-id="270736572" target="_blank"> 										<img width="39" alt="facebook" src="https://bucket.mlcdn.com/images/icons/default/round/grey/facebook.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjI0NzIzMDk5NDM0MzU3OTI5JmM9YzFqOSZiPTI3MDczNjU3NCZkPXgzbjBvOGg=.-9FdAbUYohl9ZNKJryHR6AwB65jSGwaRo9VMu-tNJCw" data-link-id="270736574" target="_blank"> 										<img width="39" alt="instagram" src="https://bucket.mlcdn.com/images/icons/default/round/grey/instagram.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjI0NzIzMDk5NDM0MzU3OTI5JmM9YzFqOSZiPTI3MDczNjU3NiZkPWkwZjNxNGE=.te3oiKEstp5fkJr-rDEEcxS9XGuIdypZNtXxs6RJoKs" data-link-id="270736576" target="_blank"> 										<img width="39" alt="linkedin" src="https://bucket.mlcdn.com/images/icons/default/round/grey/linkedin.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                    <td align="center" width="39" style="padding: 0px 5px;" ng-show="slink.link != ''">
                                                      <a href="https://click.mailerlite.com/link/c/YT0xMjI0NzIzMDk5NDM0MzU3OTI5JmM9YzFqOSZiPTI3MDczNjU3OCZkPXozazh2NGI=.k_5JYstgQ22SmAQIiBJsdPPBbK-dstDAVUvxPLtOHX0" data-link-id="270736578" target="_blank"> 										<img width="39" alt="twitter" src="https://bucket.mlcdn.com/images/icons/default/round/grey/twitter.png" style="display: block;" border="0"> 									</a>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="20" class="spacingHeight-20"></td>
                                            </tr>
                                            <tr>
                                              <td align="center" class="bodyTitle" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700; line-height: 20px; color: #111111;">Entra</td>
                                            </tr>
                                            <tr>
                                              <td align="center" class="bodyTitle" id="footerText-8" style="font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; color: #111111;">
                                                <p style="margin-top: 0px; margin-bottom: 0px;">2689 Via De La Valle, Unit F, Del Mar<br>United States</p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="25" class="spacingHeight-20"></td>
                                            </tr>
                                            <tr>

                                            </tr>
                                            <tr>
                                              <td height="10"></td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                    <table cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                      <tr>
                                        <td height="40" class="spacingHeight-40" style="line-height: 40px; min-height: 40px;"></td>
                                      </tr>
                                    </table>
                                  </selector>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <!-- Content ends here -->
                <!--[if mso 16]>
                </td>
              </tr>
            </table>
          <!--<![endif]-->
          <!--[if !mso]>
            <!-- -->
          </td>
        </tr>
      </table>
    <!--<![endif]-->
  </body>

</html>
`;

exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;
exports.welcomeEmail = welcomeEmail;
exports.resetEmail = resetEmail;
