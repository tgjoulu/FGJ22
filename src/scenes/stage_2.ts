import StageSceneBase from './stage_base';

export default class Stage2Scene extends StageSceneBase {
    protected stageName: string = 'stage_2';

    constructor() {
        super({ key: 'Stage2Scene' });
    }
}
