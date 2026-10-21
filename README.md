# Introduction

TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project.

# Getting Started

TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:

1. Installation process
2. Software dependencies
3. Latest releases
4. API references

# Build and Test

## Local HTTPS backend

With dependencies installed and the local backend running, use Node.js 22.15+ or 24+ and:

```bash
npm run dev:local
```

This development command uses the operating system's trusted certificate store for the local
HTTPS backend. The ASP.NET development certificate must already be trusted by the operating
system. Certificate validation stays enabled; keep `NODE_TLS_REJECT_UNAUTHORIZED=1` in
`.env.local`. Production build and start commands are unchanged.

TODO: Describe and show how to build your code and run the tests.

# window

```
 npm run build:window
```

# MacOs and Ubuntu

Give execution permissions to the shell script by running


```
chmod +x build-and-copy.sh

 npm run build:linux
```

# Contribute

TODO: Explain how other users and developers can contribute to make your code better.

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)
