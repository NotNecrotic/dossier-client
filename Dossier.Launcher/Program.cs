using System;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;

class Program
{
    static Process? engineProcess;
    static Process? uiProcess;
    static NotifyIcon? trayIcon;

    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        StartEngine();
        CreateTray();

        Application.Run();
    }

    static void StartEngine()
    {
        var enginePath = "Dossier.Engine.exe";

        engineProcess = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = enginePath,
                UseShellExecute = true,
                CreateNoWindow = true
            }
        };

        engineProcess.Start();
    }

    static void StartUI()
    {
        if (uiProcess != null && !uiProcess.HasExited)
            return;

        var uiPath = "Dossier.UI.exe";

        uiProcess = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = uiPath,
                UseShellExecute = true
            }
        };

        uiProcess.Start();
    }

    static void CreateTray()
    {
        trayIcon = new NotifyIcon();
        trayIcon.Icon = SystemIcons.Application;
        trayIcon.Text = "Dossier Engine Running";
        trayIcon.Visible = true;

        var menu = new ContextMenuStrip();

        menu.Items.Add("Open Dashboard", null, (s, e) => StartUI());

        menu.Items.Add("Restart Engine", null, (s, e) =>
        {
            engineProcess?.Kill();
            StartEngine();
        });

        menu.Items.Add("Exit", null, (s, e) =>
        {
            trayIcon.Visible = false;

            try { engineProcess?.Kill(); } catch { }
            try { uiProcess?.Kill(); } catch { }

            Application.Exit();
        });

        trayIcon.ContextMenuStrip = menu;
    }
}