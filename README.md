# What Is This?
This is a development framework for building faster, more structured A/B tests on the client-side. It could also be useful for writing complex scripts intended for a tag manager.

# Why Would I Want It?
If you don't have access to the full codebase of a website, the alternative would be to do the bulk of your development in the browser console or inside your A/B testing tool of choice. When building larger, more complex experiments this isn't ideal as you won't have any of the luxuries of modern web development.

This solution allows you to write complex scripts for existing websites more easily and to see your progress as you go without needed to publish anything. It adds "structure" to a normally hacky process.

# What Do I Need?
To use this framework you'll need somewhere to store the JS and CSS files you're creating in order to inject them into the page. You'll need some FTP details to a public facing server.

# Getting Set Up
These steps will take you through the initial setup for this workflow. You will only need to do this once.

## 1. Install Node.js/npm
Node.js and npm can be downloaded for Windows, macOS and Linux from nodejs.org/en/download/.

## 2. Clone the repository
`git clone https://github.com/LewisN/ABTestDevFramework.git`

## 3. Install dependencies
Navigate to the folder:
`cd ABTestDevFramework`

Then install the dependencies:
`npm install`

## 4. Sever config
Next we need to enter some FTP details so we know where to upload the files to. There are two options here:
1. Create a .env file and populate it with these key value pairs, replacing the values with your FTP details:
```
DB_HOST=YOUR HOST NAME
DB_USER=YOUR USERNAME  
DB_PASS=YOUR PASSWORD
```
2. Edit the `ftpDetails` object in `gulpfile.js`


# Creating An Experiment

## 4. Create a new experiment folder
Once everything is installed the next thing you'll want to do is create a new experiment. Run the gulp task `experiment-create` and pass the two mandatory arguments, `--clientname` and `--experimentname`.
`gulp experiment-create --clientname=Company1 --experimentname=CP001`
This will generate a new experiment folder in the _/clients/{{client}}/{{foldername}}/src_ directory with a boilerplate to get you started.

## 5. Initialise Gulp
Once you've created the experiment folder you can tell gulp to run in the background using the default task. The default gulp task takes everything inside the /src folder and performs a list of tasks on them, including concatenating and minifying files, transpiling, compiling SASS files, uploading files to your servers and more. 
To run the default task just run gulp and pass the arguments for `--clientname` and `--experimentname`, same as last time but without experiment-create:
`gulp --clientname=Company1 --experimentname=CP001`

It's also recommended for you to provide a variation number as an argument, especially if you are running a multivariate experiment. This can be done with the `--variation` flag:
`gulp --clientname=Company1 --experimentname=CP001 --variation=1`
In this command the variation argument will replace any instances of `{{VARIATION}}` in your JavaScript with the value you've provided.

## 6. Developing your experiment
### Step 6.1: Previewing your experiment
One of the Gulp taks will upload your files the server. This means you can append your main script and stylesheet to a web page which allows you to preview the experiment Run the snippet below in the console to preview your experiment, just be sure to change the experimentID variable to your experiment name, which is whatever you named the `--foldername` argument:

```var experimentID="CP001",UCGULPFLOW=function(e){var t,a,n,r="UCTEST"+Math.floor(20341*Math.random()),o=document.body;o.className=o.className+" "+r,t="//ab-test-sandbox.userconversion.com/experiments/"+e+".js?q="+r,(n=document.createElement("script")).setAttribute("type","text/javascript"),a&&(n.readyState?n.onreadystatechange=function(){"loaded"!=n.readyState&&"complete"!=n.readyState||(n.onreadystatechange=null,a())}:n.onload=function(){a()}),n.setAttribute("src",t),document.head.appendChild(n);var s=document.createElement("link");s.rel="stylesheet",s.href="//ab-test-sandbox.userconversion.com/experiments/"+e+".css?q="+r,document.head.appendChild(s)}(experimentID);```

If you run the default gulp task and leave it watching your files, they will be updated every time you hit save in your code editor. The CSS is updated dynamically so you shouldn't even need to refresh your page to see any styling changes.
There are a couple of methods we like to use to avoid having to copy and paste this into the console each time you want to preview. The first one is making use of Snippets in the Chrome DevTools. This allows you to save your snippet perpetually and then it's simply just a case of clicking 'Run'.
Another option is to use a browser extension that automatically inserts JS during page load (e.g. CJS / Custom JavaScript for Websites).

### Step 6.2: Write the rest of your code
Inside the _/clients/{{client}}/{{foldername}}/src_ folder write the code you want to run as the client-side A/B test.

### Step 6.3: Adding images
To rapidly include images whilst developing experiments, create a folder named images inside the _/src_ directory. When the default gulp task runs any image in this folder will also be uploaded to your server. The images can be accessed through the following URL structure:

`https://your-server-path/{{EXPERIMENT NAME}}-{{FILENAME}}.{{FILE EXTENSION}}`

`https://your-server-path/NewPDP-TickIcon.png`