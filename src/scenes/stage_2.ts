import StageSceneBase from './stage_base';

export default class Stage2Scene extends StageSceneBase {
    protected stageName: string = 'stage_2';
    protected nextStageName: string = 'Stage3Scene';

    constructor() {
        super({ key: 'Stage2Scene' });
    }
}
