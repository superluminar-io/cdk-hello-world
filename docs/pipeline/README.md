# Create CodePipeline

To create a custom CodePipeline for your project, you need to fork this repository to your GitHub account.

## AWS CodePipeline

![AWS CodePipeline](./code-pipeline-01.png)

## Create a new AWS CodePipeline

* Create a new CodePipeline pipeline and provide a **Pipeline name**
* Choose `new service role` and use the generated **Role name**


![AWS CodePipeline](./code-pipeline-02.png)

## Select GitHub (v2) as source provider

CodePipeline can access your GitHub repository after doing the initial _OAuth-Handshake_.

![AWS CodePipeline](./code-pipeline-03.png)

After granting CodePipeline access to your GitHub repositories, set the **Repository name** and **Brannch name** to your desired configuration.

You can _Enable_ or _Disable_ automated pipeline runs using the checkbox for **Start the pipeline on source code changes**.

Use the **CodePipeline default** setting for the artifact format.

![AWS CodePipeline](./code-pipeline-03-select.png)

## Use CodeBuild to build the project

* Create a new build stage using the **AWS CodeBuild** provider.

![AWS CodePipeline](./code-pipeline-04.png)

## Create a new CodeBuild project

After choosing your AWS region, click **Create project** to create a new CodeBuild project. A new windows will be opened with the wizard to create a new project.

![AWS CodePipeline](./code-pipeline-05.png)

Provide a **Project name** to uniquely identify your CodeBuild project to build your application.

![AWS CodePipeline](./code-pipeline-06.png)

Use **Managed Image** with **Amazon Linux 2** and **Standard** runtime. The **x86_64-standard:3.0** image works fine for most projects.

![AWS CodePipeline](./code-pipeline-07.png)

## Define Buildspec to run NPM commands

Choose **Insert build commands** to configure the needed commands to build your application. Use `npm i && npm run build` to install dependencies using NPM and running the `build` task from your `package.json` file.

![AWS CodePipeline](./code-pipeline-08.png)

## Configure CodePipeline to use the CodeBuild project

After you created the CodeBuild project, the wizard will be closed and you can continue to create your CodePipeline pipeline.

![AWS CodePipeline](./code-pipeline-09.png)

## Skip deploy stage

![AWS CodePipeline](./code-pipeline-10.png)

## Run your CodePipeline

![AWS CodePipeline](./code-pipeline-11.png)

## Next Steps

* Create a CodePipeline stage to run unit tests
* Create a CodePipeline stage to deploy your CDK application