import StageSceneBase from './stage_base';

export default class Stage4Scene extends StageSceneBase {
    public stageName: string = 'stage_4';
    protected nextStageName: string = 'Stage5Scene';

    constructor() {
        super({ key: 'Stage4Scene' });
    }
}
