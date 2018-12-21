import { PluginConfig, Plugin, BaseApp, HandleRequest } from 'jovo-core';
import aws = require('aws-sdk');
import nodemailer = require('nodemailer');
import pug = require('pug');

export interface Config extends PluginConfig {
    fromEmail: string,
    toEmail: string,
    subject: string,
    awsConfig: {
        accessKeyId: string,
        secretAccessKey: string,
        region: string,
        apiVersion: string
    }
}


export class EmailErrorPlugin implements Plugin {

    // default config
    config: Config = {
        fromEmail: '',
        toEmail: '',
        subject: 'An error has occured',
        awsConfig: {
            accessKeyId: '',
            secretAccessKey: '',
            region: '',
            apiVersion: '2010-12-01'
        }
    };

    transporter?: nodemailer.Transporter;

    constructor() {
        this.transporter = undefined;
    }

    /**
     * Hooks up plugin to the "fail" middleware
     * @param app 
     */
    install(app: BaseApp) {
        app.middleware('fail')!.use(this.log.bind(this));
        /**
         * this.config gets the values from the config.js file before it's being installed and after the constructor is called, 
         * which is the reason we initialize the transporter here, instead of the constructor
         */
        this.transporter = nodemailer.createTransport({
            SES: new aws.SES(this.config.awsConfig)
        });
    }
    uninstall(app: BaseApp){

    }   

    /**
     * Will be called every time an error occurs
     * @param handleRequest contains current app?, host?, jovo? and error? instance
     */
    log(handleRequest: HandleRequest) {
        const data = this.createLog(handleRequest);
        this.sendMail(data);
    }

    /**
     * Creates log, which will be added to the .pug file
     * @param handleRequest contains current app?, host?, jovo? and error? instance
     */
    createLog(handleRequest: HandleRequest) {
        if (!handleRequest.jovo) {
            return;
        }
        const data = {
            stackTrace: handleRequest.error!.stack,
            userId: handleRequest.jovo.$user!.getId(),
            timestamp: handleRequest.jovo.$request!.getTimestamp(),
            locale: handleRequest.jovo.$request!.getLocale(),
            platform: handleRequest.jovo.constructor.name,
            state: handleRequest.jovo.getState() ? handleRequest.jovo.getState() : '-',
            intent: handleRequest.jovo.$request!.getIntentName()
        }
        return data;
    }

    /**
     * Sends the mail
     * @param data object containing the data for the .pug file
     */
    sendMail(data: any) {
        let html = pug.renderFile(`${__dirname}/email.pug`, data);
        this.transporter!.sendMail({
            from: this.config.fromEmail,
            to: this.config.toEmail,
            subject: this.config.subject,
            html
        });
    }    
}