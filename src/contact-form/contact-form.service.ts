// src/company/job-openings/job-opening-form.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactFormDto } from './dto/contact-form.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ContactFormService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailerService,
    ) { }

    async submitForm(dto: CreateContactFormDto) {
        const { Name, phone_number, email, message } = dto;

        // Save form to DB
        // const form = await this.prisma.jobApplicationform.create({
        //     data: {
        //         first_name: first_name,
        //         last_name: last_name,
        //         phone_number: phone_number,
        //         drive_link: drive_link,
        //         comments: comments,
        //         job_opening_id,
        //     },
        // });

        // Fetch job title (fixing your bug: `id` was undefined)
        // const job = await this.prisma.jobOpenings.findUnique({
        //     where: { id: job_opening_id },
        // });

        // Send email to admin
        await this.mailService.sendMail({
            to: email,
            subject: `New Enquiry from ${Name}`,
            template: 'welcome', // looks for src/templates/welcome.pug
            context: {
                Name,
                phone_number,
                email,
                message,
                // job_title: job ? job.title : 'Unknown Position',
            },
        });

        return { message: 'Form submitted successfully.' };
    }
}
