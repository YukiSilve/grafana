// This file is autogenerated. DO NOT EDIT.
//
// To regenerate, run "make gen-cue" from repository root.
//
// Derived from the Thema lineage at pkg/coremodel/dashboard

package dashboard

import (
	"testing"

	"github.com/grafana/grafana/pkg/cuectx"
	"github.com/grafana/thema"
)

func TestSchemaAssignability(t *testing.T) {
	lin, err := Lineage(cuectx.ProvideThemaLibrary())
	if err != nil {
		t.Fatal(err)
	}

	sch := thema.SchemaP(lin, currentVersion)

	err = thema.AssignableTo(sch, &Model{})
	if err != nil {
		t.Fatal(err)
	}
}