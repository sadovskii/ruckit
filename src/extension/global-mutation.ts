import { BlackListChannelRemover } from "./black-list/button/black-list-button-object";
import { GlobalMutation } from "./global-mutation-object";

const global = new GlobalMutation();

global.addExecution(BlackListChannelRemover.addRemoverOnChannelPage);
global.addExecution(BlackListChannelRemover.addRemoverOnAlmostEverywhere);
global.addExecution(BlackListChannelRemover.addRemoverOnVideoPage);
global.run();