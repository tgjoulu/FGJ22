import StageSceneBase from './stage_base';

export default class Stage1Scene extends StageSceneBase {
    protected stageName: string = 'stage_1';

    constructor() {
        super({ key: 'Stage1Scene' });
    }
}
