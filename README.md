# npm-dependancy-graph README

This extension allows developers who use npm to visualize the dependencies of their npm project and the vulnerabilities that haunt it.

Link to Extension Marketplace: https://marketplace.visualstudio.com/items?itemName=ArtT14.npm-dependancy-graph

## Features

---

### **Display Expandable Dependency Tree**

![Expandable Dependency Tree](https://github.com/artT14/npm-dependancy-graph/blob/main/images/ExpandableTree.gif?raw=true)

> This feature allows the user to expand and visualize the dependency tree as they please. It is in DAG form so it does contain duplicates. *Note: This is done for the sake of removing complexity*

> Access it through the editor context menu or title menu via either `package.json` or `package-lock.json`. Menu Option should be `"Visualize Expandable NPM Dependency Tree"`.

### **Display Full Dependency Graph**

![Full Dependency Graph](https://github.com/artT14/npm-dependancy-graph/blob/main/images/FullGraph.gif?raw=true)

> This feature allows the user to see the whole dependency graph of their project. It displays all connections and does not contain duplicates.

> Access it through the editor context menu or title menu via either `package.json` or `package-lock.json`. Menu Option should be `"Visualize Full NPM Dependency Graph"`.

### **Display Full Vulnerability Graph**

![Alt text](https://github.com/artT14/npm-dependancy-graph/blob/main/images/VulnerabilityGraph.gif?raw=true)

> This feature allows the user to see the whole dependency graph of their project with color coded values that show vulnerability levels. 

> Access it through the editor context menu or title menu via either `package.json` or `package-lock.json`. Menu Option should be `"Visualize NPM Vulnerabilities"`.

---

## Requirements

* You must have node installed. https://nodejs.org/en/download

* You must have all node modules of your project installed in order to display the graphs. Run `npm i` in your project directory to install the dependencies and display them. The extension will warn you if you do not have them installed.

* To access the menus shown in the demos, you may only do so through either `package.json` or `package-lock.json`.

## Extension Settings

This extension does not expose any settings yet but it may in the future.

## Known Issues

None known, please submit any issues via GitHub [Issues](https://github.com/artT14/npm-dependancy-graph/issues).

## Release Notes

### **0.0.7**

> Localized force-graph scripts, can now display graph without internet access

### **0.0.6**

Fixed the following known issue listed:
> The graph links might be hard to visualize on light-mode editors as the links are colored white by default.

### **0.0.5**

>Fix Typos

### **0.0.4**

Fixed the following known issue listed:
>When visualizing vulnerabilities, your program may contain multiple instances of the same package in different versions. The graph may indicate a vulnerability on a version of a package that has since patched the vulnerability but another package is using an old vulnerable version of the afformentiond package. 

### **0.0.3**

>Add Icon

### **0.0.2**

>Fix Typos

### **0.0.1**

>Initial release of npm-dependancy-graph

---

## Dev TODO List:
* Offer support for other package managers, like `yarn` and `pnpm`

## Dev constant improvements list:
* Refactor code
* Improve performance
* Improve GUI
