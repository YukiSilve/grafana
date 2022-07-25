// Code generated by mockery v2.10.0. DO NOT EDIT.

package schedule

import (
	definitions "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	mock "github.com/stretchr/testify/mock"

	models "github.com/grafana/grafana/pkg/services/ngalert/models"
)

// AlertsSenderMock is an autogenerated mock type for the AlertsSender type
type AlertsSenderMock struct {
	mock.Mock
}

type AlertsSenderMock_Expecter struct {
	mock *mock.Mock
}

func (_m *AlertsSenderMock) EXPECT() *AlertsSenderMock_Expecter {
	return &AlertsSenderMock_Expecter{mock: &_m.Mock}
}

// Send provides a mock function with given fields: key, alerts
func (_m *AlertsSenderMock) Send(key models.AlertRuleKey, alerts definitions.PostableAlerts) {
	_m.Called(key, alerts)
}

// AlertsSenderMock_Send_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Send'
type AlertsSenderMock_Send_Call struct {
	*mock.Call
}

// Send is a helper method to define mock.On call
//  - key models.AlertRuleKey
//  - alerts definitions.PostableAlerts
func (_e *AlertsSenderMock_Expecter) Send(key interface{}, alerts interface{}) *AlertsSenderMock_Send_Call {
	return &AlertsSenderMock_Send_Call{Call: _e.mock.On("Send", key, alerts)}
}

func (_c *AlertsSenderMock_Send_Call) Run(run func(key models.AlertRuleKey, alerts definitions.PostableAlerts)) *AlertsSenderMock_Send_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(models.AlertRuleKey), args[1].(definitions.PostableAlerts))
	})
	return _c
}

func (_c *AlertsSenderMock_Send_Call) Return() *AlertsSenderMock_Send_Call {
	_c.Call.Return()
	return _c
}