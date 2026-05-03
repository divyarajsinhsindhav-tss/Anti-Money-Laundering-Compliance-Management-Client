export interface ScenarioParam {
  scenarioCode: string;
  ruleCode: string | null;
  paramKey: string;
  dataType: string;
  value: string;
}

export interface ScenarioParamUploadRequest {
  scenarioCode: string;
  ruleCode: string | null;
  paramKey: string;
  dataType: string;
  value: string;
}

export interface GroupedParams {
  [scenarioCode: string]: {
    [ruleCode: string]: ScenarioParam[];
  };
}
