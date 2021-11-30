# -*- coding: utf-8 -*-
"""PD3rdf変換ver3_修正版.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1XGFbDRkZ4exeNPebY7AtkVnUi6v-VDFA
"""

# pip install rdflib

"""xmlファイルを読み取ってttlファイルを出力"""

import xml.etree.ElementTree as ET
from rdflib import Graph, URIRef, Literal, BNode, Namespace
from rdflib.namespace import RDF, RDFS, DCTERMS, XSD
import argparse
import re

parser = argparse.ArgumentParser()
parser.add_argument('file', nargs='?')
args=parser.parse_args()

def xml_to_ttl(m):
  #ファイルの読み取り
  # tree = ET.parse(m)

  tree = ET.fromstring(m) 
  root = tree

  #ttlデータの作成
  data = Graph()

  pd3aki = Namespace('http://DigitalTriplet.net/2021/11/ontology/akiyama#')
  pd3 = Namespace('http://DigitalTriplet.net/2021/08/ontology#')
  data.bind('pd3aki', pd3aki)
  data.bind('pd3', pd3)
  data.bind('rdf', RDF)
  data.bind('dcterms', DCTERMS)
  data.bind('rdfs', RDFS)
  epURI_Num = 0


  for diagram in root.iter('diagram'):
    epstyle = diagram[0][0][0].get('style').split(';')
    if('URI=' in epstyle[0]):
      epuri = epstyle[0].replace('URI=','')
      epURI = Namespace(epuri)
    if('prefix=' in epstyle[1]):
      prefix = epstyle[1].replace('prefix=','')
    ep = URIRef(epuri)
    data.bind(prefix, epURI)
    data.add((ep, RDF.type, pd3.EP))


    for element in epstyle:
      if('title=' in element):
        title = element.replace('title=', '')
        data.add((ep, DCTERMS.title, Literal(title)))
      elif('creator=' in element):
        creator = element.replace('creator=', '')
        data.add((ep, DCTERMS.creator, Literal(creator)))
      elif('description=' in element):
        description = element.replace('description=', '')
        data.add((ep, DCTERMS.description, Literal(description)))
      elif('identifier=' in element):
        identifier = element.replace('identifier=', '')
        data.add((ep, DCTERMS.identifier, Literal(identifier)))
      elif('eptype=' in element):
        epType = element.replace('eptype=', '')
        data.add((ep, pd3.epType, Literal(epType)))

    #EPの文字情報を入手
    ret = ET.tostring(root, encoding = 'unicode')
    root1 = ET.fromstring(ret)
    for diagram in root1.findall('diagram'):
      if not epuri in diagram[0][0][0].get('style'):
        root1.remove(diagram)
    ret1 = ET.tostring(root1, encoding = 'unicode')
    data.add((ep, pd3.memo, Literal(ret1, datatype = XSD.string)))

    epURI_Num += 1  

    #エンティティの情報を入手
    for Object in diagram.iter('UserObject'):        
        mxCell = Object.find('mxCell')
        style = mxCell.get('style')
        obj = URIRef(epuri + Object.get('id'))
        #idとvalueを取得
        id = Object.get('id')
        value = Object.get('label')
        knowledgeURI = Object.get('knowledgeURI')
        engineerURI = Object.get('engineerURI')

        data.add((obj, pd3.id, Literal(id)))
        data.add((obj, pd3.value, Literal(value)))
        if knowledgeURI:
          data.add((obj, pd3aki.knowledgeURI, URIRef(knowledgeURI)))
        if engineerURI:
          data.add((obj, pd3aki.engineerURI, URIRef(engineerURI)))

        #座標、形状を取得
        data.add((obj, pd3.geoBoundingWidth, Literal(mxCell[0].get('width'))))
        data.add((obj, pd3.geoBoundingHeight, Literal(mxCell[0].get('height'))))
        data.add((obj, pd3.geoBoundingX, Literal(mxCell[0].get('x'))))
        data.add((obj, pd3.geoBoundingY, Literal(mxCell[0].get('y'))))

        for element in style.split(';'):
          if('pd3layer=' in element):
            layer = Literal(element.replace('pd3layer=', ''))
            data.add((obj, pd3.layer, layer))
        for mxCell1 in diagram.iter('mxCell'):
          if(mxCell1.get('source') == id):
            target = mxCell1.get('target')
            if('pd3type=knowledge' in style):
                  data.add((obj, pd3aki.reference, URIRef(epuri + target)))
                  data.add((obj, RDF.type, pd3aki.Knowledge))
            elif('pd3type=engineer' in style):
                  data.add((obj, pd3aki.practitioner, URIRef(epuri + target)))
                  data.add((obj, RDF.type, pd3aki.Engineer))
            elif('pd3type=tool' in style):
                  data.add((obj, pd3aki.use, URIRef(epuri + target)))
                  data.add((obj, RDF.type, pd3aki.Tool))


    for mxCell in diagram.iter('mxCell'):
      style = mxCell.get('style')
      if(style != None):
        #action
        if('pd3type=action' in style):
          action = URIRef(epuri + mxCell.get('id'))
          #idとvalueを取得
          id = mxCell.get('id')
          value = mxCell.get('value')

          data.add((action, RDF.type, pd3.Action))
          data.add((action, pd3.id, Literal(id)))
          data.add((action, pd3.value, Literal(value)))

          #座標、形状を取得
          data.add((action, pd3.geoBoundingWidth, Literal(mxCell[0].get('width'))))
          data.add((action, pd3.geoBoundingHeight, Literal(mxCell[0].get('height'))))
          data.add((action, pd3.geoBoundingX, Literal(mxCell[0].get('x'))))
          data.add((action, pd3.geoBoundingY, Literal(mxCell[0].get('y'))))

          pd3actioncheck = True
          for element in style.split(';'):
            if('pd3layer=' in element):
              layer = Literal(element.replace('pd3layer=', ''))
              data.add((action, pd3.layer, layer))
            elif('pd3action=' in element):
              actionType = Literal(element.replace('pd3action=', ''))
              data.add((action, pd3.actionType, actionType))
              pd3actioncheck = False
            elif('seeAlso=' in element):
              seeEntities = element.replace('seeAlso=', '').replace('['+prefix+']', '').split(',')
              for seeEntity in seeEntities:
                  data.add((action, RDFS.seeAlso, URIRef(epuri + seeEntity)))
          if(pd3actioncheck):
            data.add((action,pd3.actionType, Literal('nil')))
          pd3actioncheck = True

          #attribution, container, input, outputを取得
          attribution_id = mxCell.get('parent')

          for mxCell1 in diagram.iter('mxCell'):
            if(mxCell1.get('target') == id):
              data.add((action, pd3.input, URIRef(epuri + mxCell1.get('id'))))
              source_id = mxCell1.get('source')
              for mxCell2 in diagram.iter('mxCell'):
                if((mxCell2.get('style') != None) & (mxCell2.get('id') == source_id)):
                  if('pd3type=container' in mxCell2.get('style')):
                    data.add((action, pd3.expansion, URIRef(epuri + mxCell2.get('id'))))
                    break
            elif((mxCell1.get('id') == attribution_id) & (mxCell1.get('style') != None)):
              data.add((action, pd3.attribution, URIRef(epuri + attribution_id)))
            elif(mxCell1.get('source') == id):
              data.add((action, pd3.output, URIRef(epuri + mxCell1.get('id'))))

        #container
        elif('pd3type=container' in style):
          container = URIRef(epuri + mxCell.get('id'))
          #idを取得
          id = mxCell.get('id')

          data.add((container, RDF.type, pd3.Container))
          data.add((container, pd3.id, Literal(id)))
          

          #座標、形状を取得
          data.add((container, pd3.geoBoundingWidth, Literal(mxCell[0].get('width'))))
          data.add((container, pd3.geoBoundingHeight, Literal(mxCell[0].get('height'))))
          data.add((container, pd3.geoBoundingX, Literal(mxCell[0].get('x'))))
          data.add((container, pd3.geoBoundingY, Literal(mxCell[0].get('y'))))

          #layer, containerTypeを取得
          for element in style.split(';'):
            if('pd3layer=' in element):
              layer = Literal(element.replace('pd3layer=', ''))
              data.add((container, pd3.layer, layer))
            elif('containertype=' in element):
              containertype = element.replace('containertype=', '')
              data.add((container, pd3.containerType, Literal(containertype)))
            elif('seeAlso=' in element):
              seeEntities = element.replace('seeAlso=', '').replace('['+prefix+']', '').split(',')
              for seeEntity in seeEntities:
                data.add((action, RDFS.seeAlso, URIRef(epuri + seeEntity)))
              
          #valueを取得
          if(containertype == 'whilebox' or containertype == 'whilecontainer'):
            value = 'nil'
          else:
            value = mxCell.get('value')
          data.add((container, pd3.value, Literal(value)))

          #member, target, source, contractionを取得
          for mxCell1 in diagram.iter('mxCell'):
            if(mxCell1.get('parent') and mxCell1.get('parent') == id and mxCell1.get('id') ):
              data.add((container, pd3.member, URIRef(epuri + mxCell1.get('id'))))
            elif(mxCell1.get('source') == id):
              target_id = mxCell1.get('target')
              if target_id:
                data.add((container, pd3.output, URIRef(epuri + target_id)))
              for mxCell2 in diagram.iter('mxCell'):
                if((mxCell2.get('style') != None) & (mxCell2.get('id') == target_id)):
                  if('pd3type=action' in mxCell2.get('style')):
                    data.add((container, pd3.contraction, URIRef(epuri + mxCell2.get('id'))))
                    break


        #arc
        elif('pd3type=arrow' in style):
          if(mxCell.get('target') != None):
            arc = URIRef(epuri + mxCell.get('id'))

            #id,valueを取得
            id = mxCell.get('id')
            value = mxCell.get('value')
            if(value ==''):
              for mxCell1 in diagram.iter('mxCell'):
                  if(mxCell1.get('style') != None):
                    if('edgeLabel' in mxCell1.get('style')):
                      if(id == mxCell1.get('parent')):
                        value = mxCell1.get('value')
                        break
            elif(value == None):
              value = ""
            data.add((arc, pd3.id, Literal(id)))
            data.add((arc, pd3.value, Literal(value)))

            #layerを取得
            for element in style.split(';'):
              if('pd3layer=' in element):
                layer = element.replace('pd3layer=', '')
            data.add((arc, pd3.layer, Literal(layer)))

            

            #sourceがあればFlowかContainerFlow
            source = mxCell.get('source')
            target = mxCell.get('target')
            if(source != None):
              #source, targetを取得
              data.add((arc, pd3.source, URIRef(epuri + source)))
              data.add((arc, pd3.target, URIRef(epuri + target)))

              #exitX, exitY, entryX, entryYを取得
              
              for element in style.split(';'):
                if('exitX=' in element):
                  exitX = element.replace('exitX=', '')
                  data.add((arc, pd3.exitX, Literal(exitX)))
                elif('exitY=' in element):
                  exitY = element.replace('exitY=', '')
                  data.add((arc, pd3.exitY, Literal(exitY)))
                elif('entryX=' in element):
                  entryX = element.replace('entryX=', '')
                  data.add((arc, pd3.entryX, Literal(entryX)))
                elif('entryY=' in element):
                  entryY = element.replace('entryY=', '')
                  data.add((arc, pd3.entryY, Literal(entryY)))
                elif('seeAlso=' in element):
                  seeEntities = element.replace('seeAlso=', '').replace('['+prefix+']', '').split(',')
                  for seeEntity in seeEntities:
                      data.add((action, RDFS.seeAlso, URIRef(epuri + seeEntity)))
                    
              for mxCell1 in diagram.iter('mxCell'):
                if(mxCell1.get('id') == source):
                  #Flow
                  if(mxCell1.get('style') != None):
                    if('pd3type=action' in mxCell1.get('style')):
                        data.add((arc, RDF.type, pd3.Flow))
                        data.add((arc, pd3.arcType, Literal('Flow')))
                        break

                      #ContainerFlow
                    elif('pd3type=container' in mxCell1.get('style')):
                      data.add((arc, RDF.type, pd3.ContainerFlow))
                      data.add((arc, pd3.arcType, Literal('ContainerFlow')))
                      break

            else:
              #sourceがなければSupFlow
              data.add((arc, RDF.type, pd3.SupFlow))

              #targetの取得
              data.add((arc, pd3.target, URIRef(epuri + target)))

              #entryX,entryYの取得
              for element in style.split(';'):
                if('entryX=' in element):
                  entryX = element.replace('entryX=', '')
                  data.add((arc, pd3.entryX, Literal(entryX)))
                elif('entryY=' in element):
                  entryY = element.replace('entryY=', '')
                  data.add((arc, pd3.entryY, Literal(entryY)))
                elif('seeAlso=' in element):
                  seeEntities = element.replace('seeAlso=', '').replace('['+prefix+']', '').split(',')
                  for seeEntity in seeEntities:
                      data.add((action, RDFS.seeAlso, URIRef(epuri + seeEntity)))
                      
              #arcTypeの取得
              if("entryY=1;" in style):
                data.add((arc, pd3.arcType, Literal('tool/knowledge')))
              elif("entryY=0.5;" in style):
                data.add((arc, pd3.arcType, Literal('rationale')))
              elif("entryY=0;" in style):
                if("entryX=0.5;" in style):
                  data.add((arc, pd3.arcType, Literal('intention')))
                elif("entryX=1;" in style):
                  data.add((arc, pd3.arcType, Literal('annotation')))

              #位置を取得
              for mxPoint in mxCell.iter('mxPoint'):
                if(mxPoint.get('as') == 'sourcePoint'):
                  data.add((arc, pd3.geoSourcePointX, Literal(mxPoint.get('x'))))
                  data.add((arc, pd3.geoSourcePointY, Literal(mxPoint.get('y'))))
            
    
  # #print(data.serialize())
  # print(data)
  print(data.serialize())
  return data.serialize()

xml_to_ttl(args.file)