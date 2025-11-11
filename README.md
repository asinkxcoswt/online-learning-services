# Architecture

![Architecture](./architecture.drawio.png)

I use terraform to provision VPC which only have public subnets and private subnets for lambda in 2 AZs.

We can go all serverless but, I want to demonstrate possible solution, we will need VPC if there is compliance requirement.

I use S3 and DyanmoDB Gateway Endpoitn to access inside VPC.

All of these are provision by Terraform, see https://github.com/asinkxcoswt/online-learning-infra

---
