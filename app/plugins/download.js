import { saveAs } from "file-saver";

export default function ({}, inject) {
  inject("download", { saveAs });
}
