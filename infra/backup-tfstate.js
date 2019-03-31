const process = require("process");
const childProcess = require("child_process");

const exec = command => {
  childProcess.execSync(command);
};

const pad = x => {
  return String(x).length === 1 ? `0${x}` : String(x);
};

const timestamp = () => {
  const now = new Date();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `[${hh}:${mm}:${ss}]`;
};

const log = message => {
  console.log(`${timestamp()} ${message}`);
};

process.env.BORG_RELOCATED_REPO_ACCESS_IS_OK = "yes";
process.chdir(`${__dirname}/../infra`);
const tfstate = "terraform.tfstate";
const repo = ".tfstate-backup";
const gdrive = "gdrive:arrakis-infra/.tfstate-backup";

try {
  log("Backing up infra/terraform.tfstate");
  exec(`borg create ${repo}::{utcnow} ${tfstate}`);
  log("Syncing borg repo infra/.tfstate-backup to Google Drive");
  exec(`rclone sync ${repo} ${gdrive}`);
  log("Done!");
} catch (error) {
  log("Failed");
  console.log(error);
}
