![Example](./_images/example.png)

# Installation
```sh
$ npm install jovo-plugin-error-email --save
```
In your Jovo project:
```javascript
const ErrorEmail = require('jovo-plugin-error-email');

// Required:
let options = {
    fromEmail: 'fromEmail',
    toEmail: 'toEmail',
    subject: 'subject',
    awsConfig: {
        accessKeyId: 'access_key_id',
        secretAccessKey: 'secret_access_key',
        region: 'region'
    }
}
app.register('ErrorEmail', new ErrorEmail(options));
```

The plugin works with the [Amazon Simple Email Service](https://aws.amazon.com/ses/) and [nodemailer](https://nodemailer.com/about/). As you saw above you need to provide the credentials to an AWS account, which has to have the following policy attached:
```javascript
{
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ses:SendRawEmail",
            "Resource": "*"
        }
    ]
}
```
The email, which will be used to send out the messages, has to be verified!

Go to the `Email Addresses` tab on the AWS SES landing page:

![AWS SES Landing Page](./_images/aws_ses_landingPage.png)

and click on `Verify a New Email Address`:

![AWS SES Email Addresses](./_images/aws_ses_email_addresses.png)

After typing in your email address, you will receive a confirmation email and you're good to go.

# License

MIT