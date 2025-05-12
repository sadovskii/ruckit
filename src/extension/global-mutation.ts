import { BlackListChannelRemover } from "./black-list/button/black-list-button-object";
import { GlobalMutation } from "./global-mutation-object";

const global = new GlobalMutation();

global.addExecution(BlackListChannelRemover.addRemoverToVideoPage)
global.run();