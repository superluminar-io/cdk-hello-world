# Create CodePipeline

To create a custom CodePipeline for your project, you need to fork this repository to your GitHub account.

## Create a new AWS CodePipeline project

![AWS CodePipeline](./code-pipeline-01.png)

![AWS CodePipeline](./code-pipeline-02.png)

## Select GitHub (v2) as source provider

CodePipeline can access your GitHub repository after doing the initial _OAuth-Handshake_.

![AWS CodePipeline](./code-pipeline-03.png)

After granting CodePipeline access to your GitHub repositories, select the needed repository and configure the desired branch.

![AWS CodePipeline](./code-pipeline-03-select.png)

## Use CodeBuild to build the project

![AWS CodePipeline](./code-pipeline-04.png)

## Create a new CodeBuild project

![AWS CodePipeline](./code-pipeline-05.png)

![AWS CodePipeline](./code-pipeline-06.png)

![AWS CodePipeline](./code-pipeline-07.png)

## Define Buildspec to run NPM commands

![AWS CodePipeline](./code-pipeline-08.png)

## Configure CodePipeline to use the CodeBuild project

![AWS CodePipeline](./code-pipeline-09.png)

## Skip deploy stage

![AWS CodePipeline](./code-pipeline-10.png)

## Run your CodePipeline

![AWS CodePipeline](./code-pipeline-11.png)