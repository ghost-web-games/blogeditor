import { MainProcess } from "../index"
import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";
import __basedir from '../../basepath';

export class App implements MainProcess {
    mainWindow?: Electron.BrowserWindow;
    OnCreate(): void {
        app.on("ready", () => { this.createWindow() });
        app.on("window-all-closed", () => {
            // On OS X it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        app.on("activate", () => {
            // On OS X it"s common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });
    }
    createWindow() {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            height: 600,
            width: 800,
        });

        // and load the index.html of the app.
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__basedir, __dirname, "../renderer/index.html"),
            protocol: "file:",
            slashes: true,
        }));

        // Open the DevTools.
        this.mainWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        this.mainWindow.on("closed", () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.mainWindow = null as any;
        });
    }

    OnRun(): void {
    }
}