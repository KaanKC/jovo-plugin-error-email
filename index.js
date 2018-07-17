const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const { Plugin } = require('jovo-framework');
const pug = require('pug');

class EmailError extends Plugin {
    constructor(options) {
        super(options);
        this.fromEmail = options.fromEmail;
        this.toEmail = options.toEmail;
        this.subject = options.subject || 'An error has occured';
        aws.config.update(options.awsConfig);

        // create Nodemailer SES transporter
        this.transporter = nodemailer.createTransport({
            SES: new aws.SES({
                apiVersion: '2010-12-01'
            })
        });
    }

    init() {
        const { app } = this;
        app.on('handlerError', (jovo, error) => {
            this.sendMail.call(this, jovo, 'handlerError', error);
        });

        app.on('responseError', (jovo, error) => {
            this.sendMail.call(this, jovo, 'responseError', error);
        });
    }

    sendMail(jovo, errorType, error) {
        let html = pug.renderFile('./node_modules/newPlugin/email.pug', {
            errorType: errorType,
            stackTrace: error.stack.toString(),
            userId: jovo.getUserId(),
            timestamp: jovo.getTimestamp(),
            locale: jovo.getLocale(),
            platform: jovo.getType(),
            state: jovo.getState() || '-',
            intent: jovo.getIntentName()
        });
        this.transporter.sendMail({
            from: this.fromEmail,
            to: this.toEmail,
            subject: this.subject,
            html: html,
        }, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log(info.envelope);
                console.log(info.messageId);
            }
        });

    }
}

module.exports = EmailError;