import StageSceneBase from './stage_base';

export default class Stage3Scene extends StageSceneBase {
    protected stageName: string = 'stage_3';
    protected nextStageName: string = 'Stage4Scene';

    constructor() {
        super({ key: 'Stage3Scene' });
    }
}
