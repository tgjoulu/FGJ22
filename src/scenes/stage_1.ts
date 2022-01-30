import StageSceneBase from './stage_base';

export default class Stage1Scene extends StageSceneBase {
    public stageName: string = 'stage_1';
    protected nextStageName: string = 'Stage2Scene';

    constructor() {
        super({ key: 'Stage1Scene' });
    }
}
