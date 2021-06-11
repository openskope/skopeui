import streamSaver from "streamsaver";
import { WritableStream } from "web-streams-polyfill/ponyfill/es6";
streamSaver.WritableStream = WritableStream;

export default function ({}, inject) {
  inject("stream", streamSaver);
}
