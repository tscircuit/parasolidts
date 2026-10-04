// Field order follows the April 2008 XT reference and the verified V30 profile.
// See THIRD_PARTY_NOTICES.md for source and license provenance.
import {
  Entity,
  EntityReference,
  Vector3,
  type EntityField,
  serializeFields,
} from "./entity"
import {
  AttributeIdentifier,
  AttributeDefinition,
  Attribute,
  RealArray,
  PointerList,
  PointerListBlock,
} from "./attributes"

export interface BodyInit {
  id?: number
  maxLocalId?: number | null
  annotations?: EntityReference<Entity> | null
  attributeLists?: EntityReference<Entity> | null
  constructionSurfaces?: EntityReference<Entity> | null
  constructionCurves?: EntityReference<Entity> | null
  constructionPoints?: EntityReference<Point> | null
  constructionMesh?: EntityReference<Entity> | null
  constructionPolyline?: EntityReference<Entity> | null
  keyRef?: EntityReference<Entity> | null
  sizePrecision?: number | null
  linearPrecision?: number | null
  instances?: EntityReference<Entity> | null
  nextBody?: EntityReference<Body> | null
  previousBody?: EntityReference<Body> | null
  storageState?: number
  containerRef?: EntityReference<Entity> | null
  bodyKind?: number
  geometryState?: number
  legacyShell?: EntityReference<Shell> | null
  boundarySurfaces?: EntityReference<Entity> | null
  boundaryCurves?: EntityReference<Entity> | null
  boundaryPoints?: EntityReference<Point> | null
  boundaryMesh?: EntityReference<Entity> | null
  boundaryPolyline?: EntityReference<Entity> | null
  regionHead?: EntityReference<Region> | null
  edgeHead?: EntityReference<Edge> | null
  vertexHead?: EntityReference<Vertex> | null
  indexOrigin?: number | null
  indexValues?: EntityReference<Entity> | null
  nodeIdValues?: EntityReference<Entity> | null
  schemaValues?: EntityReference<Entity> | null
  childBody?: EntityReference<Body> | null
  minLocalId?: number | null
}
export class Body extends Entity {
  readonly type = "Body"
  readonly nodeType = 12
  maxLocalId: number | null
  annotations: EntityReference<Entity> | null
  attributeLists: EntityReference<Entity> | null
  constructionSurfaces: EntityReference<Entity> | null
  constructionCurves: EntityReference<Entity> | null
  constructionPoints: EntityReference<Point> | null
  constructionMesh: EntityReference<Entity> | null
  constructionPolyline: EntityReference<Entity> | null
  keyRef: EntityReference<Entity> | null
  sizePrecision: number | null
  linearPrecision: number | null
  instances: EntityReference<Entity> | null
  nextBody: EntityReference<Body> | null
  previousBody: EntityReference<Body> | null
  storageState: number
  containerRef: EntityReference<Entity> | null
  bodyKind: number
  geometryState: number
  legacyShell: EntityReference<Shell> | null
  boundarySurfaces: EntityReference<Entity> | null
  boundaryCurves: EntityReference<Entity> | null
  boundaryPoints: EntityReference<Point> | null
  boundaryMesh: EntityReference<Entity> | null
  boundaryPolyline: EntityReference<Entity> | null
  regionHead: EntityReference<Region> | null
  edgeHead: EntityReference<Edge> | null
  vertexHead: EntityReference<Vertex> | null
  indexOrigin: number | null
  indexValues: EntityReference<Entity> | null
  nodeIdValues: EntityReference<Entity> | null
  schemaValues: EntityReference<Entity> | null
  childBody: EntityReference<Body> | null
  minLocalId: number | null
  constructor(init: BodyInit = {}) {
    super(init.id)
    this.maxLocalId = init.maxLocalId === undefined ? 0 : init.maxLocalId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.attributeLists =
      init.attributeLists === undefined ? null : init.attributeLists
    this.constructionSurfaces =
      init.constructionSurfaces === undefined ? null : init.constructionSurfaces
    this.constructionCurves =
      init.constructionCurves === undefined ? null : init.constructionCurves
    this.constructionPoints =
      init.constructionPoints === undefined ? null : init.constructionPoints
    this.constructionMesh =
      init.constructionMesh === undefined ? null : init.constructionMesh
    this.constructionPolyline =
      init.constructionPolyline === undefined ? null : init.constructionPolyline
    this.keyRef = init.keyRef === undefined ? null : init.keyRef
    this.sizePrecision =
      init.sizePrecision === undefined ? 0 : init.sizePrecision
    this.linearPrecision =
      init.linearPrecision === undefined ? 0 : init.linearPrecision
    this.instances = init.instances === undefined ? null : init.instances
    this.nextBody = init.nextBody === undefined ? null : init.nextBody
    this.previousBody =
      init.previousBody === undefined ? null : init.previousBody
    this.storageState = init.storageState === undefined ? 0 : init.storageState
    this.containerRef =
      init.containerRef === undefined ? null : init.containerRef
    this.bodyKind = init.bodyKind === undefined ? 0 : init.bodyKind
    this.geometryState =
      init.geometryState === undefined ? 0 : init.geometryState
    this.legacyShell = init.legacyShell === undefined ? null : init.legacyShell
    this.boundarySurfaces =
      init.boundarySurfaces === undefined ? null : init.boundarySurfaces
    this.boundaryCurves =
      init.boundaryCurves === undefined ? null : init.boundaryCurves
    this.boundaryPoints =
      init.boundaryPoints === undefined ? null : init.boundaryPoints
    this.boundaryMesh =
      init.boundaryMesh === undefined ? null : init.boundaryMesh
    this.boundaryPolyline =
      init.boundaryPolyline === undefined ? null : init.boundaryPolyline
    this.regionHead = init.regionHead === undefined ? null : init.regionHead
    this.edgeHead = init.edgeHead === undefined ? null : init.edgeHead
    this.vertexHead = init.vertexHead === undefined ? null : init.vertexHead
    this.indexOrigin = init.indexOrigin === undefined ? 0 : init.indexOrigin
    this.indexValues = init.indexValues === undefined ? null : init.indexValues
    this.nodeIdValues =
      init.nodeIdValues === undefined ? null : init.nodeIdValues
    this.schemaValues =
      init.schemaValues === undefined ? null : init.schemaValues
    this.childBody = init.childBody === undefined ? null : init.childBody
    this.minLocalId = init.minLocalId === undefined ? 0 : init.minLocalId
  }
  getFields(): EntityField[] {
    return [
      { name: "maxLocalId", kind: "D", value: this.maxLocalId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "attributeLists", kind: "P", value: this.attributeLists },
      {
        name: "constructionSurfaces",
        kind: "P",
        value: this.constructionSurfaces,
      },
      { name: "constructionCurves", kind: "P", value: this.constructionCurves },
      { name: "constructionPoints", kind: "P", value: this.constructionPoints },
      { name: "constructionMesh", kind: "P", value: this.constructionMesh },
      {
        name: "constructionPolyline",
        kind: "P",
        value: this.constructionPolyline,
      },
      { name: "keyRef", kind: "P", value: this.keyRef },
      { name: "sizePrecision", kind: "F", value: this.sizePrecision },
      { name: "linearPrecision", kind: "F", value: this.linearPrecision },
      { name: "instances", kind: "P", value: this.instances },
      { name: "nextBody", kind: "P", value: this.nextBody },
      { name: "previousBody", kind: "P", value: this.previousBody },
      { name: "storageState", kind: "U", value: this.storageState },
      { name: "containerRef", kind: "P", value: this.containerRef },
      { name: "bodyKind", kind: "U", value: this.bodyKind },
      { name: "geometryState", kind: "U", value: this.geometryState },
      { name: "legacyShell", kind: "P", value: this.legacyShell },
      { name: "boundarySurfaces", kind: "P", value: this.boundarySurfaces },
      { name: "boundaryCurves", kind: "P", value: this.boundaryCurves },
      { name: "boundaryPoints", kind: "P", value: this.boundaryPoints },
      { name: "boundaryMesh", kind: "P", value: this.boundaryMesh },
      { name: "boundaryPolyline", kind: "P", value: this.boundaryPolyline },
      { name: "regionHead", kind: "P", value: this.regionHead },
      { name: "edgeHead", kind: "P", value: this.edgeHead },
      { name: "vertexHead", kind: "P", value: this.vertexHead },
      { name: "indexOrigin", kind: "D", value: this.indexOrigin },
      { name: "indexValues", kind: "P", value: this.indexValues },
      { name: "nodeIdValues", kind: "P", value: this.nodeIdValues },
      { name: "schemaValues", kind: "P", value: this.schemaValues },
      { name: "childBody", kind: "P", value: this.childBody },
      { name: "minLocalId", kind: "D", value: this.minLocalId },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface ShellInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  legacyBody?: EntityReference<Body> | null
  nextShell?: EntityReference<Shell> | null
  backFaces?: EntityReference<Face> | null
  wireEdges?: EntityReference<Edge> | null
  isolatedVertex?: EntityReference<Vertex> | null
  regionRef?: EntityReference<Region> | null
  frontFaces?: EntityReference<Face> | null
}
export class Shell extends Entity {
  readonly type = "Shell"
  readonly nodeType = 13
  localId: number | null
  annotations: EntityReference<Entity> | null
  legacyBody: EntityReference<Body> | null
  nextShell: EntityReference<Shell> | null
  backFaces: EntityReference<Face> | null
  wireEdges: EntityReference<Edge> | null
  isolatedVertex: EntityReference<Vertex> | null
  regionRef: EntityReference<Region> | null
  frontFaces: EntityReference<Face> | null
  constructor(init: ShellInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.legacyBody = init.legacyBody === undefined ? null : init.legacyBody
    this.nextShell = init.nextShell === undefined ? null : init.nextShell
    this.backFaces = init.backFaces === undefined ? null : init.backFaces
    this.wireEdges = init.wireEdges === undefined ? null : init.wireEdges
    this.isolatedVertex =
      init.isolatedVertex === undefined ? null : init.isolatedVertex
    this.regionRef = init.regionRef === undefined ? null : init.regionRef
    this.frontFaces = init.frontFaces === undefined ? null : init.frontFaces
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "legacyBody", kind: "P", value: this.legacyBody },
      { name: "nextShell", kind: "P", value: this.nextShell },
      { name: "backFaces", kind: "P", value: this.backFaces },
      { name: "wireEdges", kind: "P", value: this.wireEdges },
      { name: "isolatedVertex", kind: "P", value: this.isolatedVertex },
      { name: "regionRef", kind: "P", value: this.regionRef },
      { name: "frontFaces", kind: "P", value: this.frontFaces },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface FaceInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  precision?: number | null
  nextBack?: EntityReference<Face> | null
  previousBack?: EntityReference<Face> | null
  loopHead?: EntityReference<Loop> | null
  backShell?: EntityReference<Shell> | null
  surfaceRef?: EntityReference<Entity> | null
  orientation?: string
  nextSurfaceFace?: EntityReference<Face> | null
  previousSurfaceFace?: EntityReference<Face> | null
  nextFront?: EntityReference<Face> | null
  previousFront?: EntityReference<Face> | null
  frontShell?: EntityReference<Shell> | null
}
export class Face extends Entity {
  readonly type = "Face"
  readonly nodeType = 14
  localId: number | null
  annotations: EntityReference<Entity> | null
  precision: number | null
  nextBack: EntityReference<Face> | null
  previousBack: EntityReference<Face> | null
  loopHead: EntityReference<Loop> | null
  backShell: EntityReference<Shell> | null
  surfaceRef: EntityReference<Entity> | null
  orientation: string
  nextSurfaceFace: EntityReference<Face> | null
  previousSurfaceFace: EntityReference<Face> | null
  nextFront: EntityReference<Face> | null
  previousFront: EntityReference<Face> | null
  frontShell: EntityReference<Shell> | null
  constructor(init: FaceInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.precision = init.precision === undefined ? 0 : init.precision
    this.nextBack = init.nextBack === undefined ? null : init.nextBack
    this.previousBack =
      init.previousBack === undefined ? null : init.previousBack
    this.loopHead = init.loopHead === undefined ? null : init.loopHead
    this.backShell = init.backShell === undefined ? null : init.backShell
    this.surfaceRef = init.surfaceRef === undefined ? null : init.surfaceRef
    this.orientation = init.orientation === undefined ? "+" : init.orientation
    this.nextSurfaceFace =
      init.nextSurfaceFace === undefined ? null : init.nextSurfaceFace
    this.previousSurfaceFace =
      init.previousSurfaceFace === undefined ? null : init.previousSurfaceFace
    this.nextFront = init.nextFront === undefined ? null : init.nextFront
    this.previousFront =
      init.previousFront === undefined ? null : init.previousFront
    this.frontShell = init.frontShell === undefined ? null : init.frontShell
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "precision", kind: "F", value: this.precision },
      { name: "nextBack", kind: "P", value: this.nextBack },
      { name: "previousBack", kind: "P", value: this.previousBack },
      { name: "loopHead", kind: "P", value: this.loopHead },
      { name: "backShell", kind: "P", value: this.backShell },
      { name: "surfaceRef", kind: "P", value: this.surfaceRef },
      { name: "orientation", kind: "C", value: this.orientation },
      { name: "nextSurfaceFace", kind: "P", value: this.nextSurfaceFace },
      {
        name: "previousSurfaceFace",
        kind: "P",
        value: this.previousSurfaceFace,
      },
      { name: "nextFront", kind: "P", value: this.nextFront },
      { name: "previousFront", kind: "P", value: this.previousFront },
      { name: "frontShell", kind: "P", value: this.frontShell },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface LoopInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  finRef?: EntityReference<Fin> | null
  faceRef?: EntityReference<Face> | null
  nextLoop?: EntityReference<Loop> | null
}
export class Loop extends Entity {
  readonly type = "Loop"
  readonly nodeType = 15
  localId: number | null
  annotations: EntityReference<Entity> | null
  finRef: EntityReference<Fin> | null
  faceRef: EntityReference<Face> | null
  nextLoop: EntityReference<Loop> | null
  constructor(init: LoopInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.finRef = init.finRef === undefined ? null : init.finRef
    this.faceRef = init.faceRef === undefined ? null : init.faceRef
    this.nextLoop = init.nextLoop === undefined ? null : init.nextLoop
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "finRef", kind: "P", value: this.finRef },
      { name: "faceRef", kind: "P", value: this.faceRef },
      { name: "nextLoop", kind: "P", value: this.nextLoop },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface EdgeInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  precision?: number | null
  finRef?: EntityReference<Fin> | null
  previousEdge?: EntityReference<Edge> | null
  nextEdge?: EntityReference<Edge> | null
  curveRef?: EntityReference<Entity> | null
  nextCurveEdge?: EntityReference<Edge> | null
  previousCurveEdge?: EntityReference<Edge> | null
  ownerRef?: EntityReference<Entity> | null
}
export class Edge extends Entity {
  readonly type = "Edge"
  readonly nodeType = 16
  localId: number | null
  annotations: EntityReference<Entity> | null
  precision: number | null
  finRef: EntityReference<Fin> | null
  previousEdge: EntityReference<Edge> | null
  nextEdge: EntityReference<Edge> | null
  curveRef: EntityReference<Entity> | null
  nextCurveEdge: EntityReference<Edge> | null
  previousCurveEdge: EntityReference<Edge> | null
  ownerRef: EntityReference<Entity> | null
  constructor(init: EdgeInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.precision = init.precision === undefined ? 0 : init.precision
    this.finRef = init.finRef === undefined ? null : init.finRef
    this.previousEdge =
      init.previousEdge === undefined ? null : init.previousEdge
    this.nextEdge = init.nextEdge === undefined ? null : init.nextEdge
    this.curveRef = init.curveRef === undefined ? null : init.curveRef
    this.nextCurveEdge =
      init.nextCurveEdge === undefined ? null : init.nextCurveEdge
    this.previousCurveEdge =
      init.previousCurveEdge === undefined ? null : init.previousCurveEdge
    this.ownerRef = init.ownerRef === undefined ? null : init.ownerRef
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "precision", kind: "F", value: this.precision },
      { name: "finRef", kind: "P", value: this.finRef },
      { name: "previousEdge", kind: "P", value: this.previousEdge },
      { name: "nextEdge", kind: "P", value: this.nextEdge },
      { name: "curveRef", kind: "P", value: this.curveRef },
      { name: "nextCurveEdge", kind: "P", value: this.nextCurveEdge },
      { name: "previousCurveEdge", kind: "P", value: this.previousCurveEdge },
      { name: "ownerRef", kind: "P", value: this.ownerRef },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface FinInit {
  id?: number
  annotations?: EntityReference<Entity> | null
  loopRef?: EntityReference<Loop> | null
  forwardFin?: EntityReference<Fin> | null
  backwardFin?: EntityReference<Fin> | null
  endVertex?: EntityReference<Vertex> | null
  radialFin?: EntityReference<Fin> | null
  edgeRef?: EntityReference<Edge> | null
  curveRef?: EntityReference<Entity> | null
  nextVertexFin?: EntityReference<Fin> | null
  orientation?: string
}
export class Fin extends Entity {
  readonly type = "Fin"
  readonly nodeType = 17
  annotations: EntityReference<Entity> | null
  loopRef: EntityReference<Loop> | null
  forwardFin: EntityReference<Fin> | null
  backwardFin: EntityReference<Fin> | null
  endVertex: EntityReference<Vertex> | null
  radialFin: EntityReference<Fin> | null
  edgeRef: EntityReference<Edge> | null
  curveRef: EntityReference<Entity> | null
  nextVertexFin: EntityReference<Fin> | null
  orientation: string
  constructor(init: FinInit = {}) {
    super(init.id)
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.loopRef = init.loopRef === undefined ? null : init.loopRef
    this.forwardFin = init.forwardFin === undefined ? null : init.forwardFin
    this.backwardFin = init.backwardFin === undefined ? null : init.backwardFin
    this.endVertex = init.endVertex === undefined ? null : init.endVertex
    this.radialFin = init.radialFin === undefined ? null : init.radialFin
    this.edgeRef = init.edgeRef === undefined ? null : init.edgeRef
    this.curveRef = init.curveRef === undefined ? null : init.curveRef
    this.nextVertexFin =
      init.nextVertexFin === undefined ? null : init.nextVertexFin
    this.orientation = init.orientation === undefined ? "+" : init.orientation
  }
  getFields(): EntityField[] {
    return [
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "loopRef", kind: "P", value: this.loopRef },
      { name: "forwardFin", kind: "P", value: this.forwardFin },
      { name: "backwardFin", kind: "P", value: this.backwardFin },
      { name: "endVertex", kind: "P", value: this.endVertex },
      { name: "radialFin", kind: "P", value: this.radialFin },
      { name: "edgeRef", kind: "P", value: this.edgeRef },
      { name: "curveRef", kind: "P", value: this.curveRef },
      { name: "nextVertexFin", kind: "P", value: this.nextVertexFin },
      { name: "orientation", kind: "C", value: this.orientation },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface VertexInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  finHead?: EntityReference<Fin> | null
  previousVertex?: EntityReference<Vertex> | null
  nextVertex?: EntityReference<Vertex> | null
  pointRef?: EntityReference<Point> | null
  precision?: number | null
  ownerRef?: EntityReference<Entity> | null
}
export class Vertex extends Entity {
  readonly type = "Vertex"
  readonly nodeType = 18
  localId: number | null
  annotations: EntityReference<Entity> | null
  finHead: EntityReference<Fin> | null
  previousVertex: EntityReference<Vertex> | null
  nextVertex: EntityReference<Vertex> | null
  pointRef: EntityReference<Point> | null
  precision: number | null
  ownerRef: EntityReference<Entity> | null
  constructor(init: VertexInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.finHead = init.finHead === undefined ? null : init.finHead
    this.previousVertex =
      init.previousVertex === undefined ? null : init.previousVertex
    this.nextVertex = init.nextVertex === undefined ? null : init.nextVertex
    this.pointRef = init.pointRef === undefined ? null : init.pointRef
    this.precision = init.precision === undefined ? 0 : init.precision
    this.ownerRef = init.ownerRef === undefined ? null : init.ownerRef
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "finHead", kind: "P", value: this.finHead },
      { name: "previousVertex", kind: "P", value: this.previousVertex },
      { name: "nextVertex", kind: "P", value: this.nextVertex },
      { name: "pointRef", kind: "P", value: this.pointRef },
      { name: "precision", kind: "F", value: this.precision },
      { name: "ownerRef", kind: "P", value: this.ownerRef },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface RegionInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  bodyRef?: EntityReference<Body> | null
  nextRegion?: EntityReference<Region> | null
  previousRegion?: EntityReference<Region> | null
  shellHead?: EntityReference<Shell> | null
  regionKind?: string
  ownerRef?: EntityReference<Body> | null
}
export class Region extends Entity {
  readonly type = "Region"
  readonly nodeType = 19
  localId: number | null
  annotations: EntityReference<Entity> | null
  bodyRef: EntityReference<Body> | null
  nextRegion: EntityReference<Region> | null
  previousRegion: EntityReference<Region> | null
  shellHead: EntityReference<Shell> | null
  regionKind: string
  ownerRef: EntityReference<Body> | null
  constructor(init: RegionInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.bodyRef = init.bodyRef === undefined ? null : init.bodyRef
    this.nextRegion = init.nextRegion === undefined ? null : init.nextRegion
    this.previousRegion =
      init.previousRegion === undefined ? null : init.previousRegion
    this.shellHead = init.shellHead === undefined ? null : init.shellHead
    this.regionKind = init.regionKind === undefined ? "+" : init.regionKind
    this.ownerRef = init.ownerRef === undefined ? null : init.ownerRef
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "bodyRef", kind: "P", value: this.bodyRef },
      { name: "nextRegion", kind: "P", value: this.nextRegion },
      { name: "previousRegion", kind: "P", value: this.previousRegion },
      { name: "shellHead", kind: "P", value: this.shellHead },
      { name: "regionKind", kind: "C", value: this.regionKind },
      { name: "ownerRef", kind: "P", value: this.ownerRef },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface PointInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  ownerRef?: EntityReference<Entity> | null
  nextPoint?: EntityReference<Point> | null
  previousPoint?: EntityReference<Point> | null
  position?: Vector3
}
export class Point extends Entity {
  readonly type = "Point"
  readonly nodeType = 29
  localId: number | null
  annotations: EntityReference<Entity> | null
  ownerRef: EntityReference<Entity> | null
  nextPoint: EntityReference<Point> | null
  previousPoint: EntityReference<Point> | null
  position: Vector3
  constructor(init: PointInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.ownerRef = init.ownerRef === undefined ? null : init.ownerRef
    this.nextPoint = init.nextPoint === undefined ? null : init.nextPoint
    this.previousPoint =
      init.previousPoint === undefined ? null : init.previousPoint
    this.position = init.position === undefined ? new Vector3() : init.position
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "ownerRef", kind: "P", value: this.ownerRef },
      { name: "nextPoint", kind: "P", value: this.nextPoint },
      { name: "previousPoint", kind: "P", value: this.previousPoint },
      { name: "position", kind: "V", value: this.position },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface LineInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  ownerRef?: EntityReference<Entity> | null
  nextCurve?: EntityReference<Entity> | null
  previousCurve?: EntityReference<Entity> | null
  indirectOwner?: EntityReference<Entity> | null
  orientation?: string
  origin?: Vector3
  tangent?: Vector3
}
export class Line extends Entity {
  readonly type = "Line"
  readonly nodeType = 30
  localId: number | null
  annotations: EntityReference<Entity> | null
  ownerRef: EntityReference<Entity> | null
  nextCurve: EntityReference<Entity> | null
  previousCurve: EntityReference<Entity> | null
  indirectOwner: EntityReference<Entity> | null
  orientation: string
  origin: Vector3
  tangent: Vector3
  constructor(init: LineInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.ownerRef = init.ownerRef === undefined ? null : init.ownerRef
    this.nextCurve = init.nextCurve === undefined ? null : init.nextCurve
    this.previousCurve =
      init.previousCurve === undefined ? null : init.previousCurve
    this.indirectOwner =
      init.indirectOwner === undefined ? null : init.indirectOwner
    this.orientation = init.orientation === undefined ? "+" : init.orientation
    this.origin = init.origin === undefined ? new Vector3() : init.origin
    this.tangent = init.tangent === undefined ? new Vector3() : init.tangent
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "ownerRef", kind: "P", value: this.ownerRef },
      { name: "nextCurve", kind: "P", value: this.nextCurve },
      { name: "previousCurve", kind: "P", value: this.previousCurve },
      { name: "indirectOwner", kind: "P", value: this.indirectOwner },
      { name: "orientation", kind: "C", value: this.orientation },
      { name: "origin", kind: "V", value: this.origin },
      { name: "tangent", kind: "V", value: this.tangent },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export interface PlaneInit {
  id?: number
  localId?: number | null
  annotations?: EntityReference<Entity> | null
  ownerRef?: EntityReference<Entity> | null
  nextSurface?: EntityReference<Entity> | null
  previousSurface?: EntityReference<Entity> | null
  indirectOwner?: EntityReference<Entity> | null
  orientation?: string
  origin?: Vector3
  normal?: Vector3
  xDirection?: Vector3
}
export class Plane extends Entity {
  readonly type = "Plane"
  readonly nodeType = 50
  localId: number | null
  annotations: EntityReference<Entity> | null
  ownerRef: EntityReference<Entity> | null
  nextSurface: EntityReference<Entity> | null
  previousSurface: EntityReference<Entity> | null
  indirectOwner: EntityReference<Entity> | null
  orientation: string
  origin: Vector3
  normal: Vector3
  xDirection: Vector3
  constructor(init: PlaneInit = {}) {
    super(init.id)
    this.localId = init.localId === undefined ? 0 : init.localId
    this.annotations = init.annotations === undefined ? null : init.annotations
    this.ownerRef = init.ownerRef === undefined ? null : init.ownerRef
    this.nextSurface = init.nextSurface === undefined ? null : init.nextSurface
    this.previousSurface =
      init.previousSurface === undefined ? null : init.previousSurface
    this.indirectOwner =
      init.indirectOwner === undefined ? null : init.indirectOwner
    this.orientation = init.orientation === undefined ? "+" : init.orientation
    this.origin = init.origin === undefined ? new Vector3() : init.origin
    this.normal = init.normal === undefined ? new Vector3() : init.normal
    this.xDirection =
      init.xDirection === undefined ? new Vector3() : init.xDirection
  }
  getFields(): EntityField[] {
    return [
      { name: "localId", kind: "D", value: this.localId },
      { name: "annotations", kind: "P", value: this.annotations },
      { name: "ownerRef", kind: "P", value: this.ownerRef },
      { name: "nextSurface", kind: "P", value: this.nextSurface },
      { name: "previousSurface", kind: "P", value: this.previousSurface },
      { name: "indirectOwner", kind: "P", value: this.indirectOwner },
      { name: "orientation", kind: "C", value: this.orientation },
      { name: "origin", kind: "V", value: this.origin },
      { name: "normal", kind: "V", value: this.normal },
      { name: "xDirection", kind: "V", value: this.xDirection },
    ]
  }
  toSource(): string {
    return `${this.nodeType} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export class IntegerArray extends Entity {
  readonly type = "IntegerArray"
  readonly nodeType = 82
  values: (number | null)[]
  constructor(init: { id?: number; values?: (number | null)[] } = {}) {
    super(init.id)
    this.values = init.values ?? []
  }
  getFields(): EntityField[] {
    return this.values.map((value, index) => ({
      name: String(index),
      kind: "D",
      value,
    }))
  }
  toSource(): string {
    return `82 ${this.values.length} ${this.id} ${serializeFields(this.getFields())}`
  }
}

export const entityConstructors = {
  12: Body,
  13: Shell,
  14: Face,
  15: Loop,
  16: Edge,
  17: Fin,
  18: Vertex,
  19: Region,
  29: Point,
  30: Line,
  50: Plane,
  70: PointerList,
  74: PointerListBlock,
  79: AttributeIdentifier,
  80: AttributeDefinition,
  81: Attribute,
  82: IntegerArray,
  83: RealArray,
} as const
